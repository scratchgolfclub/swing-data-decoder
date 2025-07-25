import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, ExternalLink } from "lucide-react";
import { ThumbnailService } from "@/utils/thumbnailService";

interface VideoCardProps {
  video: {
    title: string;
    description: string;
    url: string;
    reason?: string; // Why this video was recommended based on user data
  };
  index: number;
}

export const VideoCard = ({ video, index }: VideoCardProps) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThumbnail = async () => {
      try {
        // Try to get custom thumbnail first
        const customThumbnail = await ThumbnailService.getThumbnail(video.url);
        if (customThumbnail) {
          setThumbnail(customThumbnail);
          setIsLoading(false);
          return;
        }
        
        // Use default thumbnail if no custom one exists
        const defaultThumbnail = ThumbnailService.getDefaultThumbnail(index);
        setThumbnail(defaultThumbnail);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading thumbnail:', error);
        // Use default thumbnail on error
        const defaultThumbnail = ThumbnailService.getDefaultThumbnail(index);
        setThumbnail(defaultThumbnail);
        setIsLoading(false);
      }
    };

    loadThumbnail();
  }, [video.url, index]);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Video Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
        {thumbnail && !isLoading ? (
          <>
            <img 
              src={thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={() => setThumbnail(null)}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              {isLoading ? (
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
              ) : (
                <Play className="h-8 w-8 text-primary ml-1" />
              )}
            </div>
          </div>
        )}
        
        {/* Play button overlay */}
        <div 
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => window.open(video.url, '_blank')}
        >
          <div className="w-20 h-20 bg-white/90 dark:bg-black/90 rounded-full flex items-center justify-center shadow-lg">
            <Play className="h-10 w-10 text-primary ml-1" />
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-20"></div>
        
        {/* Video number badge */}
        <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-sm font-semibold px-2 py-1 rounded-lg shadow-sm">
          Video {index + 1}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2 text-stone-900 dark:text-stone-100 line-clamp-2">
          {video.title}
        </h3>
        
        {/* Recommendation reason - why this video was selected */}
        {video.reason && (
          <div className="mb-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="text-xs font-medium text-primary/80 uppercase tracking-wide mb-1">
              Recommended for you:
            </div>
            <p className="text-sm text-primary/90 font-medium">
              {video.reason}
            </p>
          </div>
        )}
        
        <p className="text-muted-foreground mb-4 line-clamp-3 text-sm leading-relaxed">
          {video.description}
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={() => window.open(video.url, '_blank')}
            className="flex-1 bg-primary hover:bg-primary/90 shadow-sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Watch Video
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={() => window.open(video.url, '_blank')}
            className="shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};