import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('🎯 Starting background removal for better OCR...');
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`🔄 Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Process the image with the segmentation model
    console.log('🤖 Processing with AI segmentation model...');
    const result = await segmenter(imageData);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Create white background for better text contrast
    outputCtx.fillStyle = '#ffffff';
    outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask to enhance text areas
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = outputImageData.data;
    
    // Apply mask to enhance foreground (text areas)
    for (let i = 0; i < result[0].mask.data.length; i++) {
      const maskValue = result[0].mask.data[i];
      // Keep areas that are likely to contain text/UI elements
      if (maskValue < 0.3) { // Background areas
        const idx = i * 4;
        // Make background white for better OCR
        data[idx] = 255;     // R
        data[idx + 1] = 255; // G  
        data[idx + 2] = 255; // B
        data[idx + 3] = 255; // A
      }
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('✅ Background cleaning completed');
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.warn('⚠️ Background removal failed, proceeding without it:', error);
    // Fallback: return original image as blob
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = imageElement.naturalWidth;
      canvas.height = imageElement.naturalHeight;
      ctx.drawImage(imageElement, 0, 0);
      canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0);
    });
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Enhanced preprocessing that combines background removal with contrast enhancement
export const enhancedPreprocessingWithBackgroundRemoval = async (imageFile: File): Promise<string> => {
  try {
    console.log('🔄 Starting enhanced preprocessing with background removal...');
    
    // Load original image
    const originalImage = await loadImage(imageFile);
    
    // Remove background for better text isolation
    const cleanedBlob = await removeBackground(originalImage);
    const cleanedImage = await loadImage(cleanedBlob);
    
    // Apply additional contrast enhancement
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = cleanedImage.naturalWidth;
    canvas.height = cleanedImage.naturalHeight;
    ctx.drawImage(cleanedImage, 0, 0);
    
    // Apply additional contrast and sharpening
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Enhance contrast for text
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      
      // Boost contrast
      const contrast = 1.5;
      const adjusted = ((gray - 128) * contrast) + 128;
      const finalValue = Math.max(0, Math.min(255, adjusted));
      
      // Apply to all channels
      data[i] = finalValue;     // R
      data[i + 1] = finalValue; // G
      data[i + 2] = finalValue; // B
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    console.log('✅ Enhanced preprocessing with background removal completed');
    return canvas.toDataURL('image/png');
    
  } catch (error) {
    console.warn('⚠️ Enhanced preprocessing failed, using standard preprocessing:', error);
    // Fallback to standard preprocessing
    return enhancedPreprocessingFallback(imageFile);
  }
};

// Fallback preprocessing function
const enhancedPreprocessingFallback = async (imageFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      
      // Apply basic contrast enhancement
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // Increase contrast
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128));
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
  });
};
