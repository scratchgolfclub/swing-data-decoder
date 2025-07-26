import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SwingAnalysisData {
  swings: any[];
  club: string;
  originalFiles?: File[];
}

/**
 * New simplified swing data service that calls the updated OCR edge function
 */
export const saveSwingAnalysis = async (
  data: SwingAnalysisData, 
  userId: string
): Promise<{ success: boolean; swingIds?: string[]; error?: any }> => {
  try {
    if (!data.swings.length || !data.originalFiles?.length) {
      throw new Error('No swing data or files provided');
    }

    const swingIds: string[] = [];

    // Process each swing image
    for (let i = 0; i < data.originalFiles.length; i++) {
      const file = data.originalFiles[i];
      
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Call the updated OCR function that now handles everything
      const { data: ocrResult, error } = await supabase.functions.invoke('openai-ocr', {
        body: {
          imageBase64: base64,
          clubType: data.club,
          sessionName: `Practice Session ${new Date().toLocaleDateString()}`,
          userId: userId
        }
      });

      if (error) {
        console.error('OCR function error:', error);
        throw new Error(`Failed to process swing ${i + 1}: ${error.message}`);
      }

      if (ocrResult?.swingId) {
        swingIds.push(ocrResult.swingId);
      }
    }

    return {
      success: true,
      swingIds
    };

  } catch (error) {
    console.error('Error in saveSwingAnalysis:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Convert file to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Fetch swing data with insights for display
 */
export const fetchSwingData = async (userId: string) => {
  try {
    const { data: swings, error } = await supabase
      .from('swings')
      .select(`
        *,
        insights(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching swing data:', error);
      toast.error('Failed to load swing data');
      return [];
    }

    return swings || [];
  } catch (error) {
    console.error('Error fetching swing data:', error);
    toast.error('Failed to load swing data');
    return [];
  }
};

/**
 * Fetch specific swing with insights
 */
export const fetchSwingById = async (swingId: string, userId: string) => {
  try {
    const { data: swing, error } = await supabase
      .from('swings')
      .select(`
        *,
        insights(*)
      `)
      .eq('id', swingId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching swing:', error);
      toast.error('Failed to load swing data');
      return null;
    }

    return swing;
  } catch (error) {
    console.error('Error fetching swing:', error);
    toast.error('Failed to load swing data');
    return null;
  }
};