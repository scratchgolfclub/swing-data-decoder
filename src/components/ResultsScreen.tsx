import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Play, ChevronDown, Target, Lightbulb, Trophy, Eye } from "lucide-react";
import { getVideoRecommendations, getTextRecommendations } from "@/utils/recommendationEngine";
import scratchLogo from "@/assets/scratch-golf-logo.png";
import { useState } from 'react';

interface ResultsScreenProps {
  data: any;
  onReset: () => void;
}

export const ResultsScreen = ({ data, onReset }: ResultsScreenProps) => {
  // Pass all swing data AND selected club to recommendation functions for analysis
  const swings = data.swings || [];
  const selectedClub = data.club || '';
  const videoRecommendations = getVideoRecommendations(swings, selectedClub);
  const textRecommendations = getTextRecommendations(swings, selectedClub);
  
  // Use the first swing data for display purposes
  const swingData = swings.length > 0 ? swings[0] : {};
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    overview: true,
    workOn: false,
    drills: false,
    goal: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button 
              onClick={onReset} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Analyze Another Photo
            </Button>
            <img 
              src={scratchLogo} 
              alt="Scratch Golf Club" 
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-5xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Your Personalized Analysis
          </h1>
          <p className="text-center text-xl text-muted-foreground">Based on your TrackMan data</p>
        </div>

        {/* Video Recommendations */}
        <Card className="mb-8 shadow-lg border-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Play className="h-6 w-6 text-primary" />
              </div>
              Videos from our Pro based on your data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {videoRecommendations.map((video, index) => (
                <div key={index} className="group relative overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-sm hover:shadow-xl transition-all duration-300">
                  {/* Video Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <Play className="h-8 w-8 text-primary ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/20 to-transparent h-20"></div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 text-stone-900 dark:text-stone-100">{video.title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{video.description}</p>
                    <Button 
                      onClick={() => window.open(video.url, '_blank')}
                      className="w-full bg-primary hover:bg-primary/90 shadow-sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch Video
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Text Recommendations - Collapsible Sections */}
        <Card className="shadow-lg border-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              Your Swing Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-stone dark:prose-invert max-w-none">
              <div className="text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                {textRecommendations}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Extracted Data Preview */}
        <Card className="mt-8 shadow-lg border-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              Extracted TrackMan Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Object.entries(swingData).map(([key, value]) => (
                <div key={key} className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value || 'N/A')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};