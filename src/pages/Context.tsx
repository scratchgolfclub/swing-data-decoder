import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Edit, Save, X, Image } from 'lucide-react';
import { ThumbnailService } from '@/utils/thumbnailService';
import { VIDEO_CONTEXTS } from '@/utils/videoContextService';
import { useToast } from '@/components/ui/use-toast';

interface VideoContext {
  id: string;
  title: string;
  link: string;
  category: string;
  relatedDataPoints: string[];
  recommendWhen: string[];
  contextSummary: string;
}

// Component for handling async thumbnail loading
const ThumbnailPreview = ({ videoLink, videoTitle, videoIndex }: { videoLink: string; videoTitle: string; videoIndex: number }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThumbnail = async () => {
      try {
        const customThumbnail = await ThumbnailService.getThumbnail(videoLink);
        if (customThumbnail) {
          setThumbnailUrl(customThumbnail);
        } else {
          setThumbnailUrl(ThumbnailService.getDefaultThumbnail(videoIndex));
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading thumbnail:', error);
        setThumbnailUrl(ThumbnailService.getDefaultThumbnail(videoIndex));
        setIsLoading(false);
      }
    };

    loadThumbnail();
  }, [videoLink, videoIndex]);

  return (
    <div className="relative w-64 h-36 bg-stone-100 dark:bg-stone-800 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700">
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <img 
            src={thumbnailUrl || ThumbnailService.getDefaultThumbnail(videoIndex)}
            alt={`${videoTitle} thumbnail`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {thumbnailUrl && !thumbnailUrl.includes('unsplash.com') ? 'Custom' : 'Default'}
          </div>
        </>
      )}
    </div>
  );
};

const Context = () => {
  const { toast } = useToast();
  const [videoContexts, setVideoContexts] = useState<VideoContext[]>(VIDEO_CONTEXTS);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [editingSummary, setEditingSummary] = useState<string>('');
  const [uploadingThumbnail, setUploadingThumbnail] = useState<string | null>(null);

  const handleEditSummary = (videoId: string, newSummary: string) => {
    setVideoContexts(prev => 
      prev.map(video => 
        video.id === videoId 
          ? { ...video, contextSummary: newSummary }
          : video
      )
    );
    setEditingVideo(null);
    setEditingSummary('');
  };

  const handleThumbnailUpload = async (videoId: string, file: File) => {
    console.log('Starting thumbnail upload for:', videoId, file.name, file.size);
    setUploadingThumbnail(videoId);
    
    try {
      const video = videoContexts.find(v => v.id === videoId);
      if (!video) {
        console.error('Video not found for ID:', videoId);
        throw new Error('Video not found');
      }
      
      console.log('Found video:', video.title, 'URL:', video.link);
      
      const result = await ThumbnailService.saveThumbnail(video.link, file);
      console.log('Thumbnail saved successfully:', result.substring(0, 50) + '...');
      
      // Force a re-render by updating the state
      setVideoContexts(prev => [...prev]);
      
      toast({
        title: "Success",
        description: "Thumbnail uploaded successfully!",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      toast({
        title: "Error",
        description: `Failed to upload thumbnail: ${error.message || 'Unknown error'}`,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      console.log('Upload process completed, clearing uploading state');
      setUploadingThumbnail(null);
    }
  };

  const handleFileUpload = (videoId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload triggered for video:', videoId);
    const file = event.target.files?.[0];
    
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      if (file.type.startsWith('image/')) {
        handleThumbnailUpload(videoId, file);
      } else {
        console.error('Invalid file type:', file.type);
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
          duration: 3000,
        });
      }
    } else {
      console.log('No file selected');
    }
    
    // Clear the input value so the same file can be selected again
    event.target.value = '';
  };

  const groupedVideos = videoContexts.reduce((acc, video) => {
    if (!acc[video.category]) {
      acc[video.category] = [];
    }
    acc[video.category].push(video);
    return acc;
  }, {} as Record<string, VideoContext[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Video & Text Recommendation Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage video thumbnails and recommendation context for the personalized analysis system.
          </p>
        </div>

        {/* Video Recommendations Section */}
        <Card className="mb-8 shadow-lg border-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">Video Recommendations</CardTitle>
            <CardDescription>
              Upload custom thumbnails and manage context for each video recommendation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(groupedVideos).map(([category, videos]) => (
              <div key={category} className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-primary">{category}</h3>
                <div className="space-y-4">
                  {videos.map((video) => (
                    <Card key={video.id} className="border border-stone-200 dark:border-stone-700">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{video.title}</CardTitle>
                            <CardDescription className="mt-1">
                              <a 
                                href={video.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {video.link}
                              </a>
                            </CardDescription>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {/* Thumbnail Upload */}
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(video.id, e)}
                                className="hidden"
                                id={`thumbnail-upload-${video.id}`}
                                disabled={uploadingThumbnail === video.id}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`thumbnail-upload-${video.id}`)?.click()}
                                disabled={uploadingThumbnail === video.id}
                                className="flex items-center gap-2"
                              >
                                {uploadingThumbnail === video.id ? (
                                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                                ) : (
                                  <Image className="h-4 w-4" />
                                )}
                                {uploadingThumbnail === video.id ? 'Uploading...' : 'Upload Thumbnail'}
                              </Button>
                            </div>
                            
                            {/* Edit Summary */}
                            {editingVideo === video.id ? (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditSummary(video.id, editingSummary)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingVideo(null);
                                    setEditingSummary('');
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingVideo(video.id);
                                  setEditingSummary(video.contextSummary);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Thumbnail Preview Section */}
                          <div>
                            <h4 className="font-semibold mb-2">Current Thumbnail:</h4>
                            <ThumbnailPreview 
                              videoLink={video.link}
                              videoTitle={video.title}
                              videoIndex={videos.indexOf(video)}
                              key={`${video.id}-${uploadingThumbnail}`} // Force re-render when thumbnail changes
                            />
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Related Data Points:</h4>
                            <div className="flex flex-wrap gap-2">
                              {video.relatedDataPoints.map((point, index) => (
                                <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                                  {point}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Recommend When:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {video.recommendWhen.map((condition, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-primary mr-2">•</span>
                                  {condition}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Context Summary:</h4>
                            {editingVideo === video.id ? (
                              <Textarea
                                value={editingSummary}
                                onChange={(e) => setEditingSummary(e.target.value)}
                                className="min-h-[100px]"
                              />
                            ) : (
                              <p className="text-sm text-muted-foreground bg-stone-50 dark:bg-stone-800 p-3 rounded-md">
                                {video.contextSummary}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Context;