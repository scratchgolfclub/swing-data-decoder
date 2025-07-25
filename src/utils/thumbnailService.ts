import { supabase } from '@/integrations/supabase/client';

interface ThumbnailMapping {
  [videoUrl: string]: string;
}

export class ThumbnailService {
  private static STORAGE_KEY = 'video_thumbnails';
  private static BUCKET_NAME = 'video-thumbnails';

  static async compressImage(file: File, maxWidth: number = 400, maxHeight: number = 225, quality: number = 0.8): Promise<File> {
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
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          
          // Create a new File from the blob
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          
          console.log(`Image compressed from ${file.size} bytes to ${compressedFile.size} bytes`);
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  static async saveThumbnail(videoUrl: string, thumbnailFile: File): Promise<string> {
    try {
      console.log(`Starting compression for ${thumbnailFile.name} (${thumbnailFile.size} bytes)`);
      
      // Compress the image before saving
      const compressedFile = await this.compressImage(thumbnailFile);
      
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExtension = 'jpg';
      const fileName = `thumbnail_${timestamp}.${fileExtension}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload thumbnail: ${uploadError.message}`);
      }

      if (!uploadData) {
        throw new Error('Upload failed: No data returned');
      }

      // Save mapping in database
      const { error: dbError } = await supabase
        .from('video_thumbnails')
        .upsert({
          video_url: videoUrl,
          thumbnail_path: uploadData.path
        }, {
          onConflict: 'video_url'
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file if database save fails
        await supabase.storage.from(this.BUCKET_NAME).remove([uploadData.path]);
        throw new Error(`Failed to save thumbnail mapping: ${dbError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(uploadData.path);

      console.log('Thumbnail compressed and saved successfully');
      return publicUrl;
    } catch (error) {
      console.error('Error in saveThumbnail:', error);
      throw error;
    }
  }

  static async getThumbnail(videoUrl: string): Promise<string | null> {
    try {
      // First check local storage for legacy thumbnails
      const legacyThumbnail = this.getLegacyThumbnail(videoUrl);
      if (legacyThumbnail) {
        return legacyThumbnail;
      }

      // Query database for thumbnail
      const { data, error } = await supabase
        .from('video_thumbnails')
        .select('thumbnail_path')
        .eq('video_url', videoUrl)
        .maybeSingle();

      if (error) {
        console.error('Error fetching thumbnail:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.thumbnail_path);

      return publicUrl;
    } catch (error) {
      console.error('Error getting thumbnail:', error);
      return null;
    }
  }

  static async deleteThumbnail(videoUrl: string): Promise<void> {
    try {
      // Get the thumbnail path first
      const { data, error: fetchError } = await supabase
        .from('video_thumbnails')
        .select('thumbnail_path')
        .eq('video_url', videoUrl)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching thumbnail for deletion:', fetchError);
        return;
      }

      if (data) {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([data.thumbnail_path]);

        if (storageError) {
          console.error('Error deleting from storage:', storageError);
        }

        // Delete from database
        const { error: dbError } = await supabase
          .from('video_thumbnails')
          .delete()
          .eq('video_url', videoUrl);

        if (dbError) {
          console.error('Error deleting from database:', dbError);
        }
      }

      // Also clean up legacy localStorage
      this.deleteLegacyThumbnail(videoUrl);
    } catch (error) {
      console.error('Error deleting thumbnail:', error);
    }
  }

  // Legacy support methods for localStorage thumbnails
  private static getLegacyThumbnail(videoUrl: string): string | null {
    const mappings = this.getThumbnailMappings();
    return mappings[videoUrl] || null;
  }

  private static deleteLegacyThumbnail(videoUrl: string): void {
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