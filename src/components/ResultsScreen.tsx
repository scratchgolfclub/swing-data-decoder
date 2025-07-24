import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play } from "lucide-react";
import { getVideoRecommendations, getTextRecommendations } from "@/utils/recommendationEngine";

interface ResultsScreenProps {
  data: any;
  onReset: () => void;
}

export const ResultsScreen = ({ data, onReset }: ResultsScreenProps) => {
  const videoRecommendations = getVideoRecommendations(data);
  const textRecommendations = getTextRecommendations(data);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={onReset} 
            variant="outline" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Analyze Another Photo
          </Button>
          <h1 className="text-4xl font-bold text-center mb-2">Your Personalized Analysis</h1>
          <p className="text-center text-muted-foreground">Based on your TrackMan data</p>
        </div>

        {/* Video Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              Videos from our Pro based on your data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videoRecommendations.map((video, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold mb-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{video.description}</p>
                  <Button 
                    onClick={() => window.open(video.url, '_blank')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch Video
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Text Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>What to Work On</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none dark:prose-invert">
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {textRecommendations}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extracted Data Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Extracted Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="font-medium text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <span className="font-bold">{value as string}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};