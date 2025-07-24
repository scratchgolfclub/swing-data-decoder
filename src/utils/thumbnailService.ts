interface ThumbnailMapping {
  [videoUrl: string]: string;
}

export class ThumbnailService {
  private static STORAGE_KEY = 'video_thumbnails';

  static async compressImage(file: File, maxWidth: number = 400, maxHeight: number = 225, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress the image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        console.log(`Image compressed from ${file.size} bytes to ~${Math.round(compressedDataUrl.length * 0.75)} bytes`);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  static async saveThumbnail(videoUrl: string, thumbnailFile: File): Promise<string> {
    try {
      console.log(`Starting compression for ${thumbnailFile.name} (${thumbnailFile.size} bytes)`);
      
      // Compress the image before saving
      const compressedData = await this.compressImage(thumbnailFile);
      
      // Save to localStorage
      const mappings = this.getThumbnailMappings();
      mappings[videoUrl] = compressedData;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mappings));
      
      console.log('Thumbnail compressed and saved successfully');
      return compressedData;
    } catch (error) {
      console.error('Error in saveThumbnail:', error);
      throw error;
    }
  }

  static getThumbnail(videoUrl: string): string | null {
    const mappings = this.getThumbnailMappings();
    return mappings[videoUrl] || null;
  }

  static deleteThumbnail(videoUrl: string): void {
    const mappings = this.getThumbnailMappings();
    delete mappings[videoUrl];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mappings));
  }

  static getThumbnailMappings(): ThumbnailMapping {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  static getDefaultThumbnail(index: number): string {
    const defaultThumbnails = [
      'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=225&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=225&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop&crop=center'
    ];
    return defaultThumbnails[index % defaultThumbnails.length];
  }
}