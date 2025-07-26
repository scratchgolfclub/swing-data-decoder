import { supabase } from "@/integrations/supabase/client";
import { getStructuredMetrics, getMetricValue } from "@/utils/structuredMetricsHelper";

export interface GoalSuggestion {
  metric_name: string;
  current_value: number;
  target_value: number;
  target_date: Date;
  improvement_needed: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Metric improvement thresholds and ideal ranges
const METRIC_CONFIGS = {
  'Total Distance': { ideal: 280, unit: 'yards', improvementRate: 5, lowerIsBetter: false },
  'Carry Distance': { ideal: 260, unit: 'yards', improvementRate: 4, lowerIsBetter: false },
  'Side': { ideal: 0, unit: 'yards', improvementRate: 2, lowerIsBetter: true },
  'Club Head Speed': { ideal: 105, unit: 'mph', improvementRate: 2, lowerIsBetter: false },
  'Ball Speed': { ideal: 155, unit: 'mph', improvementRate: 3, lowerIsBetter: false },
  'Smash Factor': { ideal: 1.48, unit: '', improvementRate: 0.02, lowerIsBetter: false },
  'Launch Angle': { ideal: 12, unit: '°', improvementRate: 1, lowerIsBetter: false },
  'Spin Rate': { ideal: 2500, unit: 'rpm', improvementRate: 100, lowerIsBetter: false }
};

export const analyzeWorstMetric = async (userId: string): Promise<GoalSuggestion | null> => {
  try {
    // Get user's latest swing data
    const { data: swingData, error } = await supabase
      .from('swings')
      .select('structured_metrics, club_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !swingData || swingData.length === 0) return null;

    // Analyze metrics across recent swings
    const metricPerformance: Record<string, { values: number[], average: number, deviation: number }> = {};

    swingData.forEach(swing => {
      const metrics = getStructuredMetrics(swing.structured_metrics);
      
      metrics.forEach(metric => {
        const value = getMetricValue(metrics, metric.title);
        if (value !== null && METRIC_CONFIGS[metric.title as keyof typeof METRIC_CONFIGS]) {
          if (!metricPerformance[metric.title]) {
            metricPerformance[metric.title] = { values: [], average: 0, deviation: 0 };
          }
          metricPerformance[metric.title].values.push(value);
        }
      });
    });

    // Calculate averages and find worst performing metric
    let worstMetric: string | null = null;
    let worstScore = 0;

    Object.keys(metricPerformance).forEach(metricName => {
      const config = METRIC_CONFIGS[metricName as keyof typeof METRIC_CONFIGS];
      const values = metricPerformance[metricName].values;
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      metricPerformance[metricName].average = average;
      
      // Calculate performance score (distance from ideal)
      const idealValue = config.ideal;
      const deviation = config.lowerIsBetter 
        ? Math.abs(average) // For metrics where 0 is ideal (like Side)
        : Math.abs(average - idealValue) / idealValue;
      
      metricPerformance[metricName].deviation = deviation;
      
      if (deviation > worstScore) {
        worstScore = deviation;
        worstMetric = metricName;
      }
    });

    if (!worstMetric) return null;

    // Generate goal suggestion
    const config = METRIC_CONFIGS[worstMetric as keyof typeof METRIC_CONFIGS];
    const currentValue = metricPerformance[worstMetric].average;
    
    // Calculate realistic improvement (20-30% improvement over 3 months)
    const improvementFactor = config.lowerIsBetter ? 0.3 : 0.2;
    const targetValue = config.lowerIsBetter 
      ? currentValue * (1 - improvementFactor) // Reduce deviation
      : currentValue + (config.improvementRate * 4); // 4 weeks of improvement
    
    // Set target date 3 months from now
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 3);
    
    // Determine difficulty based on improvement needed
    const improvementNeeded = Math.abs(targetValue - currentValue);
    const difficulty = improvementNeeded > config.improvementRate * 6 ? 'hard' : 
                     improvementNeeded > config.improvementRate * 3 ? 'medium' : 'easy';

    return {
      metric_name: worstMetric,
      current_value: Math.round(currentValue * 100) / 100,
      target_value: Math.round(targetValue * 100) / 100,
      target_date: targetDate,
      improvement_needed: Math.round(improvementNeeded * 100) / 100,
      difficulty
    };

  } catch (error) {
    console.error('Error analyzing worst metric:', error);
    return null;
  }
};

export const createAIGoal = async (userId: string, suggestion: GoalSuggestion) => {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .insert({
        user_id: userId,
        goal_type: 'data_point',
        assignment_type: 'ai_assigned',
        metric_name: suggestion.metric_name,
        current_value: suggestion.current_value,
        target_value: suggestion.target_value,
        target_date: suggestion.target_date.toISOString().split('T')[0],
        progress_percentage: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating AI goal:', error);
    return null;
  }
};