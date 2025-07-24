// Canvas-based OCR with advanced image processing techniques
import Tesseract from 'tesseract.js';

// Advanced image filters for better OCR
class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  constructor(image: HTMLImageElement) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    
    // Set up canvas with high resolution
    const scale = 3;
    this.canvas.width = image.width * scale;
    this.canvas.height = image.height * scale;
    
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
  }
  
  // Apply Gaussian blur for noise reduction
  applyGaussianBlur(radius: number = 1): this {
    this.ctx.filter = `blur(${radius}px)`;
    this.ctx.drawImage(this.canvas, 0, 0);
    this.ctx.filter = 'none';
    return this;
  }
  
  // Apply edge enhancement
  applyEdgeEnhancement(): this {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Edge detection kernel
    const kernel = [
      [-1, -1, -1],
      [-1,  8, -1],
      [-1, -1, -1]
    ];
    
    const output = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const weight = kernel[ky + 1][kx + 1];
            
            r += data[idx] * weight;
            g += data[idx + 1] * weight;
            b += data[idx + 2] * weight;
          }
        }
        
        const idx = (y * width + x) * 4;
        output[idx] = Math.max(0, Math.min(255, r));
        output[idx + 1] = Math.max(0, Math.min(255, g));
        output[idx + 2] = Math.max(0, Math.min(255, b));
      }
    }
    
    this.ctx.putImageData(new ImageData(output, width, height), 0, 0);
    return this;
  }
  
  // Apply adaptive threshold
  applyAdaptiveThreshold(): this {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Convert to grayscale first
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    
    // Calculate local thresholds
    const windowSize = 15;
    const output = new Uint8ClampedArray(data);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        // Calculate local mean
        let sum = 0;
        let count = 0;
        
        for (let wy = Math.max(0, y - windowSize); wy <= Math.min(height - 1, y + windowSize); wy++) {
          for (let wx = Math.max(0, x - windowSize); wx <= Math.min(width - 1, x + windowSize); wx++) {
            const widx = (wy * width + wx) * 4;
            sum += data[widx];
            count++;
          }
        }
        
        const localMean = sum / count;
        const threshold = localMean * 0.9; // Slightly lower threshold
        
        const value = data[idx] > threshold ? 255 : 0;
        output[idx] = value;
        output[idx + 1] = value;
        output[idx + 2] = value;
      }
    }
    
    this.ctx.putImageData(new ImageData(output, width, height), 0, 0);
    return this;
  }
  
  // Apply morphological operations
  applyMorphology(): this {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Erosion followed by dilation (opening operation)
    const temp = new Uint8ClampedArray(data);
    
    // Erosion
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        let minVal = 255;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nidx = ((y + dy) * width + (x + dx)) * 4;
            minVal = Math.min(minVal, data[nidx]);
          }
        }
        
        temp[idx] = minVal;
        temp[idx + 1] = minVal;
        temp[idx + 2] = minVal;
      }
    }
    
    // Dilation
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        let maxVal = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nidx = ((y + dy) * width + (x + dx)) * 4;
            maxVal = Math.max(maxVal, temp[nidx]);
          }
        }
        
        data[idx] = maxVal;
        data[idx + 1] = maxVal;
        data[idx + 2] = maxVal;
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
    return this;
  }
  
  // Get the processed image as data URL
  getDataURL(): string {
    return this.canvas.toDataURL('image/png', 1.0);
  }
  
  // Get the canvas for further processing
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}

// Enhanced canvas-based OCR with multiple processing pipelines
export const extractTextWithCanvasOCR = async (imageFile: File): Promise<string> => {
  console.log('🎨 Starting Canvas-based OCR with advanced processing...');
  
  try {
    // Load image
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = URL.createObjectURL(imageFile);
    });
    
    // Try multiple processing pipelines
    const pipelines = [
      // Pipeline 1: Basic enhancement
      (processor: ImageProcessor) => processor.applyAdaptiveThreshold(),
      
      // Pipeline 2: Edge enhancement + threshold
      (processor: ImageProcessor) => processor.applyEdgeEnhancement().applyAdaptiveThreshold(),
      
      // Pipeline 3: Noise reduction + threshold + morphology
      (processor: ImageProcessor) => processor.applyGaussianBlur(0.5).applyAdaptiveThreshold().applyMorphology(),
      
      // Pipeline 4: Heavy processing
      (processor: ImageProcessor) => processor.applyGaussianBlur(1).applyEdgeEnhancement().applyAdaptiveThreshold().applyMorphology()
    ];
    
    const results: { text: string; pipeline: number; length: number }[] = [];
    
    for (let i = 0; i < pipelines.length; i++) {
      try {
        console.log(`🔄 Running canvas pipeline ${i + 1}/${pipelines.length}...`);
        
        const processor = new ImageProcessor(img);
        pipelines[i](processor);
        const processedImageUrl = processor.getDataURL();
        
        // Run OCR on processed image
        const { data: { text } } = await Tesseract.recognize(processedImageUrl, 'eng', {
          logger: () => {} // Suppress logs for cleaner output
        });
        
        results.push({
          text: text.trim(),
          pipeline: i + 1,
          length: text.trim().length
        });
        
        console.log(`✅ Pipeline ${i + 1} completed: ${text.trim().length} characters`);
        
      } catch (error) {
        console.warn(`⚠️ Canvas pipeline ${i + 1} failed:`, error);
      }
    }
    
    // Find the best result (most text extracted)
    if (results.length === 0) {
      throw new Error('All canvas processing pipelines failed');
    }
    
    const bestResult = results.reduce((best, current) => {
      return current.length > best.length ? current : best;
    });
    
    console.log(`🏆 Best canvas result: Pipeline ${bestResult.pipeline} with ${bestResult.length} characters`);
    return bestResult.text;
    
  } catch (error) {
    console.error('❌ Canvas OCR failed:', error);
    throw error;
  }
};