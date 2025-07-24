// Multi-OCR Service - Combines multiple OCR engines for maximum accuracy
import Tesseract from 'tesseract.js';
import { extractTextWithPaddleOCR, isPaddleOCRAvailable } from './paddleOcrService';
import { extractTextWithCanvasOCR } from './canvasOcrService';

export interface OCRResult {
  engine: string;
  text: string;
  confidence?: number;
  processingTime: number;
}

export interface OCRConfig {
  enableTesseract: boolean;
  enablePaddleOCR: boolean;
  enableCanvasOCR: boolean;
  enableAdvancedPreprocessing: boolean;
  preferredEngine?: 'tesseract' | 'paddle' | 'canvas' | 'auto';
}

// Default configuration
const defaultConfig: OCRConfig = {
  enableTesseract: true,
  enablePaddleOCR: false, // Disabled until stable
  enableCanvasOCR: true,
  enableAdvancedPreprocessing: true,
  preferredEngine: 'auto'
};

// Advanced image preprocessing for better OCR accuracy
const preprocessImageForOCR = async (imageFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Scale up for better text recognition
      const scale = 2;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      // High quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Apply preprocessing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Convert to grayscale and enhance contrast
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Weighted grayscale conversion
        const gray = r * 0.299 + g * 0.587 + b * 0.114;
        
        // Enhance contrast for text
        const enhanced = gray < 140 ? Math.max(0, gray - 30) : Math.min(255, gray + 30);
        
        data[i] = enhanced;
        data[i + 1] = enhanced;
        data[i + 2] = enhanced;
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png', 1.0));
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
  });
};

// Enhanced Tesseract OCR with multiple configurations
const extractWithTesseract = async (imageUrl: string): Promise<OCRResult> => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Running enhanced Tesseract OCR...');
    
    // Try multiple Tesseract configurations
    const configs = [
      { 
        options: { 
          logger: () => {},
        }
      },
      {
        options: {
          logger: () => {},
        }
      }
    ];
    
    let bestResult = '';
    let bestScore = 0;
    
    for (let i = 0; i < configs.length; i++) {
      try {
        const { data: { text, confidence } } = await Tesseract.recognize(imageUrl, 'eng', configs[i].options);
        
        // Score based on text length and confidence
        const score = text.length * (confidence / 100);
        
        if (score > bestScore) {
          bestScore = score;
          bestResult = text;
        }
        
        console.log(`✅ Tesseract config ${i + 1} completed: ${text.length} chars, confidence: ${confidence}`);
      } catch (error) {
        console.warn(`⚠️ Tesseract config ${i + 1} failed:`, error);
      }
    }
    
    return {
      engine: 'tesseract',
      text: bestResult,
      processingTime: Date.now() - startTime
    };
    
  } catch (error) {
    console.error('❌ Tesseract OCR failed:', error);
    return {
      engine: 'tesseract',
      text: '',
      processingTime: Date.now() - startTime
    };
  }
};

// Extract text using Canvas OCR wrapper
const extractWithCanvasOCR = async (imageFile: File): Promise<OCRResult> => {
  const startTime = Date.now();
  
  try {
    const text = await extractTextWithCanvasOCR(imageFile);
    
    return {
      engine: 'canvas',
      text: text,
      processingTime: Date.now() - startTime
    };
    
  } catch (error) {
    console.error('❌ Canvas OCR failed:', error);
    return {
      engine: 'canvas',
      text: '',
      processingTime: Date.now() - startTime
    };
  }
};

// Extract text using PaddleOCR wrapper
const extractWithPaddleOCR = async (imageFile: File): Promise<OCRResult> => {
  const startTime = Date.now();
  
  try {
    const text = await extractTextWithPaddleOCR(imageFile);
    
    return {
      engine: 'paddle',
      text: text,
      processingTime: Date.now() - startTime
    };
    
  } catch (error) {
    console.error('❌ PaddleOCR failed:', error);
    return {
      engine: 'paddle',
      text: '',
      processingTime: Date.now() - startTime
    };
  }
};

// Main multi-OCR function
export const extractTextWithMultiOCR = async (
  imageFile: File, 
  config: Partial<OCRConfig> = {}
): Promise<OCRResult[]> => {
  const finalConfig = { ...defaultConfig, ...config };
  const results: OCRResult[] = [];
  
  console.log('🚀 Starting Multi-OCR extraction...');
  console.log('📊 Configuration:', finalConfig);
  
  // Preprocess image if enabled
  let preprocessedImageUrl = '';
  if (finalConfig.enableAdvancedPreprocessing) {
    try {
      preprocessedImageUrl = await preprocessImageForOCR(imageFile);
      console.log('✅ Image preprocessing completed');
    } catch (error) {
      console.warn('⚠️ Preprocessing failed, using original image:', error);
      preprocessedImageUrl = URL.createObjectURL(imageFile);
    }
  } else {
    preprocessedImageUrl = URL.createObjectURL(imageFile);
  }
  
  // Run OCR engines in parallel
  const ocrPromises: Promise<OCRResult>[] = [];
  
  if (finalConfig.enableTesseract) {
    ocrPromises.push(extractWithTesseract(preprocessedImageUrl));
  }
  
  if (finalConfig.enableCanvasOCR) {
    ocrPromises.push(extractWithCanvasOCR(imageFile));
  }
  
  if (finalConfig.enablePaddleOCR) {
    const paddleAvailable = await isPaddleOCRAvailable();
    if (paddleAvailable) {
      ocrPromises.push(extractWithPaddleOCR(imageFile));
    } else {
      console.warn('⚠️ PaddleOCR not available, skipping...');
    }
  }
  
  // Wait for all OCR engines to complete
  const ocrResults = await Promise.allSettled(ocrPromises);
  
  ocrResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    } else {
      console.error(`❌ OCR engine ${index} failed:`, result.reason);
    }
  });
  
  // Sort results by quality (longer text with reasonable processing time)
  results.sort((a, b) => {
    const scoreA = a.text.length - (a.processingTime / 1000); // Penalize long processing time
    const scoreB = b.text.length - (b.processingTime / 1000);
    return scoreB - scoreA;
  });
  
  console.log('📊 Multi-OCR Results Summary:');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.engine}: ${result.text.length} chars in ${result.processingTime}ms`);
  });
  
  return results;
};

// Get best result from multi-OCR
export const getBestOCRResult = (results: OCRResult[]): string => {
  if (results.length === 0) return '';
  
  // Return the result with the most text content
  const bestResult = results.reduce((best, current) => {
    return current.text.length > best.text.length ? current : best;
  });
  
  console.log(`🏆 Best OCR result: ${bestResult.engine} with ${bestResult.text.length} characters`);
  return bestResult.text;
};

// Check which OCR engines are available
export const getAvailableOCREngines = async (): Promise<string[]> => {
  const engines: string[] = [];
  
  // Tesseract is always available
  engines.push('tesseract');
  
  // Canvas OCR is always available
  engines.push('canvas');
  
  // Check PaddleOCR availability (currently disabled)
  // if (await isPaddleOCRAvailable()) {
  //   engines.push('paddle');
  // }
  
  return engines;
};