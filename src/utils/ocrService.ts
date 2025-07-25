import { supabase } from '@/integrations/supabase/client';

// Convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

export const extractTextFromImage = async (imageFile: File): Promise<{ metrics: any[] }> => {
  try {
    console.log('🚀 Starting OCR extraction with OpenAI Vision...');
    
    // Convert image to base64
    const imageBase64 = await fileToBase64(imageFile);
    
    // Use OpenAI structured metrics extraction
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OpenAI timeout')), 30000)
    );
    
    const ocrPromise = supabase.functions.invoke('openai-ocr', {
      body: { imageBase64 }
    });
    
    const { data, error } = await Promise.race([ocrPromise, timeoutPromise]) as any;
    
    if (error || !data?.metrics) {
      throw new Error(error?.message || 'Failed to extract structured metrics');
    }
    
    console.log('✅ OpenAI OCR extraction completed:', data.metrics.length, 'metrics');
    return { metrics: data.metrics };
    
  } catch (error) {
    console.error('❌ OCR extraction failed:', error);
    throw new Error(`OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const extractTrackmanData = async (imageFile: File) => {
  try {
    console.log('🔍 Starting TrackMan data extraction...');
    
    // Extract structured metrics using our OCR service
    const extractedResult = await extractTextFromImage(imageFile);
    
    console.log(`✅ Successfully extracted ${extractedResult.metrics.length} structured metrics`);
    return { structuredMetrics: extractedResult.metrics };
    
  } catch (error) {
    console.error('❌ TrackMan data extraction failed:', error);
    throw error;
  }
};

export const extractMultipleTrackmanData = async (imageFiles: File[]) => {
  try {
    console.log('🔍 Starting OCR processing for', imageFiles.length, 'files');
    
    const results = await Promise.all(
      imageFiles.map(async (file, index) => {
        console.log(`📁 Processing file ${index + 1}: ${file.name}`);
        
        const data = await extractTrackmanData(file);
        return { ...data, swingNumber: index + 1 };
      })
    );
    
    return results;
  } catch (error) {
    console.error('❌ Multiple OCR Error:', error);
    throw error;
  }
};

// No longer needed - using structured metrics only