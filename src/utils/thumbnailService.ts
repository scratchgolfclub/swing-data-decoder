interface ThumbnailMapping {
  [videoUrl: string]: string;
}

export class ThumbnailService {
  private static STORAGE_KEY = 'video_thumbnails';

  static saveThumbnail(videoUrl: string, thumbnailFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const thumbnailData = e.target?.result as string;
        
        // Save to localStorage
        const mappings = this.getThumbnailMappings();
        mappings[videoUrl] = thumbnailData;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mappings));
        
        resolve(thumbnailData);
      };
      reader.onerror = reject;
      reader.readAsDataURL(thumbnailFile);
    });
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