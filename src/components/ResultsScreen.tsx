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
  // Use the first swing data for recommendations
  const swingData = data.swings && data.swings.length > 0 ? data.swings[0] : {};
  const videoRecommendations = getVideoRecommendations(swingData);
  const textRecommendations = getTextRecommendations(swingData);
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
            
            {/* Overview Section */}
            <Collapsible open={openSections.overview} onOpenChange={() => toggleSection('overview')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-stone-50 dark:bg-stone-800 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">Overview</span>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${openSections.overview ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pt-4">
                <div className="prose prose-stone dark:prose-invert max-w-none">
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                    🧠 Understanding Club Path & Face Angle<br/>
                    In simple terms:<br/><br/>
                    Club Path is the direction the club is traveling at impact — either right (in-to-out), left (out-to-in), or neutral.<br/><br/>
                    Face Angle is where the clubface is pointing relative to the target at impact.<br/><br/>
                    The relationship between face angle and club path determines the ball's starting direction and curve.
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* What to Work On Section */}
            <Collapsible open={openSections.workOn} onOpenChange={() => toggleSection('workOn')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-stone-50 dark:bg-stone-800 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">What to Work On</span>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${openSections.workOn ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pt-4">
                <div className="prose prose-stone dark:prose-invert max-w-none">
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                    🛠️ Neutralizing Club Path<br/>
                    Your face-to-path relationship is solid, but the out-to-in club path is the root of the fade. To hit straighter or even draw-biased shots, we want to move your club path closer to 0°, or even slightly positive (in-to-out).
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Drills Section */}
            <Collapsible open={openSections.drills} onOpenChange={() => toggleSection('drills')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-stone-50 dark:bg-stone-800 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">Drills & Feel Changes</span>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${openSections.drills ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pt-4">
                <div className="prose prose-stone dark:prose-invert max-w-none">
                  <div className="text-stone-700 dark:text-stone-300 leading-relaxed space-y-4">
                    <div>
                      <strong>✅ Alignment Stick Drill:</strong><br/>
                      Place an alignment stick on the ground pointing slightly right of your target (1–2 yards). Feel your swing path trace along the stick on your downswing to promote an in-to-out path.
                    </div>
                    <div>
                      <strong>✅ Split Hand Drill:</strong><br/>
                      Grip the club with your normal top hand. Place your bottom hand halfway down the shaft. Make slow swings feeling the club move from inside to out.
                    </div>
                    <div>
                      <strong>✅ "Swing to Right Field" Feel:</strong><br/>
                      On the range, pick a target to the right of your actual target. Make swings visualizing the ball launching in that direction.
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Goal Section */}
            <Collapsible open={openSections.goal} onOpenChange={() => toggleSection('goal')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-stone-50 dark:bg-stone-800 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">Goal</span>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${openSections.goal ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pt-4">
                <div className="prose prose-stone dark:prose-invert max-w-none">
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                    🔁 <strong>Target Goals:</strong><br/>
                    • Shift club path from -2.7° closer to neutral (0°) or even slightly positive (+1 to +2°)<br/>
                    • Maintain a face angle that's 1–2° closed to the path to produce a slight draw or straight shot
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

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