import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import { VideoCard } from "@/components/VideoCard";

interface VideoRecommendationsSectionProps {
  swingData: any;
  insights: any[];
}

export const VideoRecommendationsSection = ({ swingData, insights }: VideoRecommendationsSectionProps) => {
  // Only get videos from insights (vector search results)
  const insightVideos = insights
    .filter(insight => insight.video_url)
    .map(insight => ({
      title: insight.title,
      description: insight.description,
      url: insight.video_url,
      reason: `Recommended based on your ${insight.insight_type}: ${insight.title}`
    }));

  // If no videos found from insights, show empty state
  if (insightVideos.length === 0) {
    return (
      <Card className="bg-surface border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-accent" />
            Recommended Training Videos
            <Badge variant="outline" className="ml-auto">
              0 videos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground">
            <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium mb-2">No video recommendations available</p>
            <p className="text-sm">
              Video recommendations are generated based on your swing analysis. 
              Try uploading more swing data for personalized video suggestions.
            </p>
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
            {insightVideos.length} video{insightVideos.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insightVideos.map((video, index) => (
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
              <span className="font-medium">AI-Powered Recommendations:</span> These videos are specifically selected 
              based on your swing analysis using our knowledge base and vector search technology.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};