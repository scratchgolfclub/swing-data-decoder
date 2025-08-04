import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, ExternalLink } from "lucide-react";
import { VideoCard } from "@/components/VideoCard";
import { getVideoRecommendations } from "@/utils/videoContextService";

interface VideoRecommendationsSectionProps {
  swingData: any;
  insights: any[];
}

export const VideoRecommendationsSection = ({ swingData, insights }: VideoRecommendationsSectionProps) => {
  // Get video recommendations based on swing data - handle both array and single swing
  const swingArray = Array.isArray(swingData) ? swingData : (swingData?.swings || [swingData]);
  const recommendedVideos = getVideoRecommendations(swingArray);
  
  // Also check if insights have video URLs
  const insightVideos = insights
    .filter(insight => insight.video_url)
    .map(insight => ({
      title: insight.title,
      description: insight.description,
      url: insight.video_url,
      reason: `Recommended based on your ${insight.insight_type}: ${insight.title}`
    }));

  // Combine both sources and remove duplicates
  const allVideos = [
    ...recommendedVideos.slice(0, 3).map(video => ({
      title: video.title,
      description: video.contextSummary,
      url: video.link,
      reason: `Recommended based on your swing metrics`
    })),
    ...insightVideos
  ];

  // Remove duplicate URLs
  const uniqueVideos = allVideos.filter((video, index, self) => 
    index === self.findIndex(v => v.url === video.url)
  ).slice(0, 4); // Limit to 4 videos max

  // If no videos found, show some default recommendations
  if (uniqueVideos.length === 0) {
    const defaultVideos = [
      {
        title: 'Golf Posture',
        description: 'Foundation for consistent swing mechanics and setup',
        url: 'https://scratchgc.wistia.com/medias/5u6i7fhjfk',
        reason: 'Setup fundamental'
      },
      {
        title: 'Club Path on TrackMan',
        description: 'Understanding club path and ball flight laws',
        url: 'https://scratchgc.wistia.com/medias/ufxhjffk9q',
        reason: 'Ball flight education'
      }
    ];
    
    return (
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-accent" />
            Recommended Training Videos
            <Badge variant="outline" className="ml-auto">
              {defaultVideos.length} videos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {defaultVideos.map((video, index) => (
              <VideoCard
                key={video.url}
                video={video}
                index={index}
              />
            ))}
          </div>
          <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Play className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">General Recommendations:</span> Upload more swings for personalized video suggestions based on your specific swing data.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-accent" />
          Recommended Training Videos
          <Badge variant="outline" className="ml-auto">
            {uniqueVideos.length} video{uniqueVideos.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {uniqueVideos.map((video, index) => (
            <VideoCard
              key={video.url}
              video={video}
              index={index}
            />
          ))}
        </div>
        
        {uniqueVideos.length > 0 && (
          <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Play className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Video Learning:</span> These videos are specifically selected based on your swing data and areas for improvement. 
                Watch them in order for a structured learning path.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};