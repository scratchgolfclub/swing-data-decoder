import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface SwingAnalysisData {
  swings: any[];
  club: string;
  originalFiles: File[];
}

export const saveSwingAnalysis = async (data: SwingAnalysisData, userId: string) => {
  try {
    console.log('Saving swing analysis for user:', userId);
    
    // Check if user has existing baseline swing
    const { data: existingBaseline } = await (supabase as any)
      .from('swing_data')
      .select('id')
      .eq('user_id', userId)
      .eq('is_baseline', true)
      .maybeSingle();
    
    const hasBaseline = !!existingBaseline;
    console.log('User has existing baseline:', hasBaseline);
    
    // Save each swing to the database
    const savedSwings = [];
    
    for (let i = 0; i < data.swings.length; i++) {
      const swing = data.swings[i];
      const originalFile = data.originalFiles[i];
      
      // Upload image to storage if file exists
      let imageUrl = null;
      if (originalFile) {
        const fileExt = originalFile.name.split('.').pop();
        const fileName = `${userId}/${uuidv4()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('trackman-images')
          .upload(fileName, originalFile);
        
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('trackman-images')
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        }
      }
      
      // Determine if this is baseline and where to store data
      const isFirstSwingEver = !hasBaseline && i === 0;
      
      // Save swing data to database - only structured metrics
      const { data: swingData, error: swingError } = await (supabase as any)
        .from('swing_data')
        .insert({
          user_id: userId,
          club_type: data.club,
          structured_metrics: !isFirstSwingEver ? (swing.structuredMetrics || []) : [],
          structured_baseline_metrics: isFirstSwingEver ? (swing.structuredMetrics || []) : [],
          trackman_image_url: imageUrl,
          session_name: `Session ${new Date().toLocaleDateString()}`,
          swing_score: calculateSwingScore(swing),
          is_baseline: isFirstSwingEver
        })
        .select()
        .single();
      
      if (swingError) {
        console.error('Error saving swing data:', swingError);
        throw swingError;
      }
      
      savedSwings.push(swingData);
    }
    
    // Save progress tracking data
    if (savedSwings.length > 0) {
      const firstSwing = savedSwings[0];
      const analysisResult = analyzeSwingForProgress(data.swings[0]);
      
      const { error: progressError } = await (supabase as any)
        .from('progress_tracker')
        .insert({
          user_id: userId,
          swing_data_id: firstSwing.id,
          overall_score: firstSwing.swing_score,
          strengths: analysisResult.strengths,
          improvement_areas: analysisResult.improvements,
          progress_summary: generateProgressSummary(analysisResult),
          notes: `Analysis completed on ${new Date().toDateString()}`
        });
      
      if (progressError) {
        console.error('Error saving progress data:', progressError);
        // Don't throw here as swing data was already saved
      }
    }
    
    return { success: true, swingIds: savedSwings.map(s => s.id) };
    
  } catch (error) {
    console.error('Error in saveSwingAnalysis:', error);
    return { success: false, error };
  }
};

const calculateSwingScore = (swingData: any): number => {
  const { getStructuredMetrics, getMetricValue } = require('./structuredMetricsHelper');
  
  // Simple scoring based on key metrics using structured format
  let score = 50; // Base score
  
  const structuredMetrics = getStructuredMetrics(swingData.structuredMetrics || []);
  
  const metrics = [
    { key: 'Ball Speed', ideal: { min: 145, max: 180 }, weight: 15 },
    { key: 'Smash Factor', ideal: { min: 1.4, max: 1.5 }, weight: 20 },
    { key: 'Carry Distance', ideal: { min: 200, max: 280 }, weight: 15 },
    { key: 'Club Path', ideal: { min: -2, max: 2 }, weight: 10 },
    { key: 'Face Angle', ideal: { min: -2, max: 2 }, weight: 10 },
    { key: 'Attack Angle', ideal: { min: -2, max: 3 }, weight: 10 },
    { key: 'Launch Angle', ideal: { min: 12, max: 18 }, weight: 10 },
    { key: 'Spin Rate', ideal: { min: 2000, max: 3500 }, weight: 10 }
  ];
  
  metrics.forEach(metric => {
    const value = getMetricValue(structuredMetrics, metric.key);
    if (value !== null && !isNaN(value)) {
      const isInRange = value >= metric.ideal.min && value <= metric.ideal.max;
      if (isInRange) {
        score += metric.weight;
      } else {
        const deviation = Math.min(
          Math.abs(value - metric.ideal.min),
          Math.abs(value - metric.ideal.max)
        );
        const normalizedDeviation = Math.min(deviation / (metric.ideal.max - metric.ideal.min), 1);
        score += metric.weight * (1 - normalizedDeviation);
      }
    }
  });
  
  return Math.round(Math.max(0, Math.min(100, score)));
};

const analyzeSwingForProgress = (swingData: any) => {
  const { getStructuredMetrics, getMetricValue } = require('./structuredMetricsHelper');
  
  const strengths = [];
  const improvements = [];
  
  const structuredMetrics = getStructuredMetrics(swingData.structuredMetrics || []);
  
  const metrics = [
    { key: 'Ball Speed', name: 'Ball Speed', ideal: { min: 145, max: 180 } },
    { key: 'Smash Factor', name: 'Smash Factor', ideal: { min: 1.4, max: 1.5 } },
    { key: 'Carry Distance', name: 'Carry Distance', ideal: { min: 200, max: 280 } },
    { key: 'Club Path', name: 'Club Path', ideal: { min: -2, max: 2 } },
    { key: 'Face Angle', name: 'Face Angle', ideal: { min: -2, max: 2 } }
  ];
  
  metrics.forEach(metric => {
    const value = getMetricValue(structuredMetrics, metric.key);
    if (value !== null && !isNaN(value)) {
      const isInRange = value >= metric.ideal.min && value <= metric.ideal.max;
      if (isInRange) {
        strengths.push(metric.name);
      } else {
        improvements.push(metric.name);
      }
    }
  });
  
  return { strengths: strengths.slice(0, 3), improvements: improvements.slice(0, 3) };
};

const generateProgressSummary = (analysisResult: any): string => {
  const { strengths, improvements } = analysisResult;
  
  let summary = '';
  if (strengths.length > 0) {
    summary += `Strong areas: ${strengths.join(', ')}. `;
  }
  if (improvements.length > 0) {
    summary += `Focus on improving: ${improvements.join(', ')}.`;
  }
  
  return summary || 'Continue working on overall swing consistency.';
};