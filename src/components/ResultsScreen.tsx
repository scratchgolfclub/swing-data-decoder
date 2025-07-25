import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowLeft, Play, ChevronDown, Target, Lightbulb, Trophy, Eye, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { getVideoRecommendations, getTextRecommendations } from "@/utils/recommendationEngine";
import { FirecrawlService } from "@/utils/FirecrawlService";
import { VideoCard } from "@/components/VideoCard";
import { ApiKeyDialog } from "@/components/ApiKeyDialog";
import scratchLogo from "@/assets/scratch-golf-logo.png";
import { useState, useEffect } from 'react';

// Component to format swing analysis text with proper styling
const SwingAnalysisFormatter = ({ text, isSimpleMode }: { text: string; isSimpleMode: boolean }) => {
  const cleanText = text.replace(/\*\*/g, '');
  const sections = cleanText.split('\n\n').filter(section => section.trim());
  
  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const lines = section.split('\n').filter(line => line.trim());
        const [firstLine, ...remainingLines] = lines;
        
        // Create truncated version for simple mode
        const content = isSimpleMode 
          ? lines.slice(0, Math.min(lines.length, 3)) // Show first 3 lines max in simple mode
          : lines;
        
        return (
          <Collapsible key={index} defaultOpen={index === 0}>
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 bg-stone-50 dark:bg-stone-800 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
              <div className="flex items-center gap-3">
                {firstLine.match(/^[🎯📊🚀🌲🛠️⛳]/) ? (
                  <span className="text-xl">{firstLine.match(/^[🎯📊🚀🌲🛠️⛳]/)?.[0]}</span>
                ) : (
                  <Target className="h-5 w-5 text-primary" />
                )}
                <h3 className="text-lg font-semibold text-left">
                  {firstLine.replace(/^[🎯📊🚀🌲🛠️⛳]\s*/, '')}
                </h3>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform ui-open:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="space-y-3 pt-2">
                {content.slice(1).map((line, lineIndex) => {
                  const trimmedLine = line.trim();
                  
                  // Bullet points
                  if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
                    return (
                      <div key={lineIndex} className="flex items-start gap-2 ml-2">
                        <span className="text-primary mt-1.5 text-xs">●</span>
                        <span className="text-muted-foreground leading-relaxed text-sm">
                          {trimmedLine.replace(/^[-•]\s*/, '')}
                        </span>
                      </div>
                    );
                  }
                  
                  // Regular text
                  return (
                    <p key={lineIndex} className="text-muted-foreground leading-relaxed text-sm ml-2">
                      {trimmedLine}
                    </p>
                  );
                })}
                {isSimpleMode && lines.length > 3 && (
                  <p className="text-xs text-muted-foreground/70 ml-2 italic">
                    Switch to Advanced mode to see full analysis...
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};

// Component to analyze swing data and provide summary
const getSwingSummary = (swingData: any) => {
  const allMetrics = [];
  
  // Analyze all available metrics with ideal ranges
  const metrics = [
    { key: 'ballSpeed', name: 'Ball Speed', ideal: { min: 145, max: 180 }, unit: 'mph', goodAbove: true },
    { key: 'smashFactor', name: 'Smash Factor', ideal: { min: 1.4, max: 1.5 }, unit: '', goodAbove: true },
    { key: 'carryDistance', name: 'Carry Distance', ideal: { min: 200, max: 280 }, unit: 'yds', goodAbove: true },
    { key: 'clubPath', name: 'Club Path', ideal: { min: -2, max: 2 }, unit: '°', goodAbove: false },
    { key: 'faceAngle', name: 'Face Angle', ideal: { min: -2, max: 2 }, unit: '°', goodAbove: false },
    { key: 'attackAngle', name: 'Attack Angle', ideal: { min: -2, max: 3 }, unit: '°', goodAbove: false },
    { key: 'launchAngle', name: 'Launch Angle', ideal: { min: 12, max: 18 }, unit: '°', goodAbove: false },
    { key: 'spinRate', name: 'Spin Rate', ideal: { min: 2000, max: 3500 }, unit: 'rpm', goodAbove: false }
  ];

  metrics.forEach(metric => {
    const value = swingData[metric.key];
    if (value && !isNaN(parseFloat(value))) {
      const numValue = parseFloat(value);
      const isInRange = numValue >= metric.ideal.min && numValue <= metric.ideal.max;
      const deviation = isInRange ? 0 : Math.min(
        Math.abs(numValue - metric.ideal.min),
        Math.abs(numValue - metric.ideal.max)
      );
      
      allMetrics.push({
        ...metric,
        value: metric.unit ? `${value}${metric.unit}` : value,
        numValue,
        isGood: isInRange,
        deviation,
        reason: isInRange 
          ? `Excellent ${metric.name.toLowerCase()} within ideal range`
          : `Work on ${metric.name.toLowerCase()} for better performance`
      });
    }
  });

  // Get one best metric (in good range)
  const goodMetrics = allMetrics.filter(m => m.isGood);
  const goodPoints = goodMetrics.length > 0 ? [goodMetrics[0]] : [];
  
  // Get one worst metric (furthest from ideal) or pick one for improvement even if all are good
  const needsWork = allMetrics.length > 0 
    ? [allMetrics.sort((a, b) => b.deviation - a.deviation)[0]]
    : [];

  return { goodPoints, needsWork };
};

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
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  
  // Get swing summary
  const { goodPoints, needsWork } = getSwingSummary(swingData);
  
  // Filter videos based on mode
  const displayedVideos = isSimpleMode ? videoRecommendations.slice(0, 1) : videoRecommendations.slice(0, 3);

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
              src="/lovable-uploads/8ca06ed2-bd76-4910-ad83-6e8259bf704b.png" 
              alt="SGC Logo" 
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-5xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Your Personalized Analysis
          </h1>
          <p className="text-center text-xl text-muted-foreground">Based on your TrackMan data</p>
        </div>

        {/* Quick Summary Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Good Points */}
          <Card className="border-0 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                These Numbers Look Great
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goodPoints.length > 0 ? (
                <div className="space-y-3">
                  {goodPoints.slice(0, 1).map((point, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <div>
                        <div className="font-semibold text-green-800 dark:text-green-200">{point.name}</div>
                        <div className="text-sm text-green-600 dark:text-green-400">{point.reason}</div>
                      </div>
                      <div className="text-lg font-bold text-green-700 dark:text-green-300">{point.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-700 dark:text-green-300">Upload more data to see your strengths!</p>
              )}
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card className="border-0 bg-amber-50 dark:bg-amber-950/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                These Numbers Need Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              {needsWork.length > 0 ? (
                <div className="space-y-3">
                  {needsWork.slice(0, 1).map((point, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <div>
                        <div className="font-semibold text-amber-800 dark:text-amber-200">{point.name}</div>
                        <div className="text-sm text-amber-600 dark:text-amber-400">{point.reason}</div>
                      </div>
                      <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{point.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-amber-700 dark:text-amber-300">Your swing metrics look solid overall!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mode Toggle */}
        <Card className="mb-8 border-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-6">
              <h3 className="text-lg font-semibold text-center">Report Detail Level</h3>
              <div className="relative bg-gradient-to-r from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-750 p-1.5 rounded-xl shadow-inner border border-stone-200 dark:border-stone-700">
                <div 
                  className={`absolute top-1.5 bottom-1.5 bg-gradient-to-r from-primary to-primary/90 rounded-lg shadow-lg transition-all duration-500 ease-out transform ${
                    isSimpleMode 
                      ? 'left-1.5 right-[50%] translate-x-0' 
                      : 'left-[50%] right-1.5 translate-x-0'
                  }`}
                />
                <div className="relative z-10 flex w-full">
                  <button
                    onClick={() => setIsSimpleMode(true)}
                    className={`flex-1 px-8 py-3 text-sm font-medium transition-all duration-300 rounded-lg ${
                      isSimpleMode 
                        ? 'text-primary-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-stone-700/50'
                    }`}
                  >
                    Simple
                  </button>
                  <button
                    onClick={() => setIsSimpleMode(false)}
                    className={`flex-1 px-8 py-3 text-sm font-medium transition-all duration-300 rounded-lg ${
                      !isSimpleMode 
                        ? 'text-primary-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-stone-700/50'
                    }`}
                  >
                    Advanced
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-2xl">
                <strong>Simple:</strong> Get 1 key video and concise analysis highlights. 
                <strong className="ml-4">Advanced:</strong> Access 2-3 videos with detailed technical breakdown and comprehensive recommendations.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Video Recommendations */}
        <Card className="mb-8 shadow-lg border-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Play className="h-6 w-6 text-primary" />
              </div>
              Your {isSimpleMode ? 'Simple' : 'Advanced'} Lesson Plan
              <span className="text-sm font-normal text-muted-foreground">
                ({isSimpleMode ? '1' : displayedVideos.length} video{displayedVideos.length !== 1 ? 's' : ''})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {displayedVideos.map((video, index) => (
                <div key={index} className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Why we're recommending this video:</h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      {video.reason || `Based on your ${needsWork[0]?.name || 'swing data'}, this video will help you improve your technique and consistency.`}
                    </p>
                  </div>
                  <VideoCard 
                    video={video} 
                    index={index}
                  />
                </div>
              ))}
            </div>
            {displayedVideos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No specific video recommendations available for your current data.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Redesigned Swing Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Summary */}
          <Card className="shadow-lg border-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                {isSimpleMode ? (
                  <>
                    <p>Based on your TrackMan data, we've identified key areas for improvement.</p>
                    {goodPoints.length > 0 && (
                      <p className="text-green-700 dark:text-green-300">
                        ✓ Your <strong>{goodPoints[0].name}</strong> is excellent at {goodPoints[0].value}
                      </p>
                    )}
                    {needsWork.length > 0 && (
                      <p className="text-amber-700 dark:text-amber-300">
                        → Focus on improving your <strong>{needsWork[0].name}</strong> from {needsWork[0].value}
                      </p>
                    )}
                    <p>Our lesson plan targets these specific metrics to help you shoot lower scores.</p>
                  </>
                ) : (
                  <>
                    <p>Your TrackMan data reveals important insights about your current swing patterns and ball flight characteristics. Our analysis examines critical metrics including club path, face angle, attack angle, and impact dynamics to create a comprehensive improvement strategy.</p>
                    {goodPoints.length > 0 && (
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500">
                        <p className="text-green-700 dark:text-green-300 font-medium">
                          ✓ Strength: <strong>{goodPoints[0].name}</strong> at {goodPoints[0].value}
                        </p>
                        <p className="text-green-600 dark:text-green-400 text-xs mt-1">
                          This metric falls within the optimal range for your club type, indicating solid fundamentals in this area. Maintaining this consistency will support your overall improvement.
                        </p>
                      </div>
                    )}
                    {needsWork.length > 0 && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border-l-4 border-amber-500">
                        <p className="text-amber-700 dark:text-amber-300 font-medium">
                          → Priority Area: <strong>{needsWork[0].name}</strong> at {needsWork[0].value}
                        </p>
                        <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                          This measurement indicates room for improvement. Addressing this metric will likely have the greatest impact on your ball flight consistency and overall performance.
                        </p>
                      </div>
                    )}
                    <p>Our systematic approach addresses root causes rather than just symptoms. Each recommended drill and feel is designed to create lasting changes in your swing mechanics, leading to more predictable ball flights and lower scores.</p>
                    <p className="text-xs text-muted-foreground/80 italic">The lesson plan prioritizes the most impactful changes first, ensuring efficient use of your practice time.</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Goal */}
          <Card className="shadow-lg border-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-primary" />
                Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                {isSimpleMode ? (
                  <>
                    <p><strong>Primary Focus:</strong> {needsWork[0]?.name || 'Overall swing consistency'}</p>
                    {needsWork[0] && (
                      <p><strong>Target Range:</strong> {needsWork[0].ideal?.min}-{needsWork[0].ideal?.max}{needsWork[0].unit}</p>
                    )}
                    <p><strong>Expected Timeline:</strong> 2-4 weeks with consistent practice</p>
                    <p><strong>Success Metric:</strong> More consistent ball striking and improved distance control</p>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500 mb-4">
                      <p><strong>Primary Focus:</strong> {needsWork[0]?.name || 'Overall swing consistency'}</p>
                      {needsWork[0] && (
                        <p className="text-xs mt-1"><strong>Target Range:</strong> {needsWork[0].ideal?.min}-{needsWork[0].ideal?.max}{needsWork[0].unit}</p>
                      )}
                    </div>
                    <p><strong>Short-term Goal (2-4 weeks):</strong> Establish more consistent impact conditions and ball flight patterns. Focus on reducing variability in your primary metric while maintaining existing strengths.</p>
                    <p><strong>Medium-term Goal (1-3 months):</strong> Integrate improved mechanics into full-speed swings. Develop muscle memory for new positions and feelings. Track progress with additional TrackMan sessions.</p>
                    <p><strong>Long-term Goal (3-6 months):</strong> Lower handicap through more predictable ball flights and improved course management. Reduced penalty strokes from errant shots.</p>
                    <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg mt-3">
                      <p className="text-xs"><strong>Success Metrics:</strong></p>
                      <p className="text-xs">• Tighter dispersion patterns (±10 yards laterally)</p>
                      <p className="text-xs">• More consistent carry distances (±5 yards)</p>
                      <p className="text-xs">• Improved scoring average within 4-6 weeks</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Drills/Feels */}
          <Card className="shadow-lg border-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-primary" />
                Drills & Feels
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSimpleMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-primary">Practice Drills</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-primary mt-1">●</span>
                        <span>Alignment stick drill for better swing plane</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary mt-1">●</span>
                        <span>Impact bag work for solid contact</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary mt-1">●</span>
                        <span>Tempo training with metronome</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-primary">Swing Feels</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-primary mt-1">●</span>
                        <span>Feel like you're hitting up on the ball</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary mt-1">●</span>
                        <span>Maintain steady head position through impact</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary mt-1">●</span>
                        <span>Focus on smooth, controlled acceleration</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Practice Drills - Advanced */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h4 className="text-lg font-semibold text-primary">Practice Drills</h4>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">Advanced</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
                        <h5 className="font-medium text-foreground mb-2">Alignment Stick Progression</h5>
                        <p className="text-xs text-muted-foreground mb-2">Target: Consistent swing plane and path</p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>• Place stick along target line for feet alignment</p>
                          <p>• Add second stick along shaft at setup for plane reference</p>
                          <p>• Practice swings staying parallel to plane stick</p>
                          <p>• Graduate to hitting balls with visual feedback</p>
                        </div>
                      </div>
                      <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
                        <h5 className="font-medium text-foreground mb-2">Impact Bag Sequence</h5>
                        <p className="text-xs text-muted-foreground mb-2">Target: Solid contact and compression</p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>• Start with slow motion impacts (no backswing)</p>
                          <p>• Focus on shaft lean and body position at impact</p>
                          <p>• Add quarter swings maintaining impact feel</p>
                          <p>• Progress to half swings with same impact quality</p>
                        </div>
                      </div>
                      <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
                        <h5 className="font-medium text-foreground mb-2">Tempo & Timing Work</h5>
                        <p className="text-xs text-muted-foreground mb-2">Target: Consistent rhythm and sequence</p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>• Use metronome for 3:1 backswing to downswing ratio</p>
                          <p>• Practice with different club weights for feel</p>
                          <p>• Focus on smooth transition, not speed</p>
                          <p>• Build up from practice swings to ball striking</p>
                        </div>
                      </div>
                      <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
                        <h5 className="font-medium text-foreground mb-2">Gate Drill Progression</h5>
                        <p className="text-xs text-muted-foreground mb-2">Target: Path and face control</p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>• Set up alignment sticks 6 inches apart</p>
                          <p>• Practice swinging through without contact</p>
                          <p>• Add ball and work on clean path</p>
                          <p>• Narrow gates as accuracy improves</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Swing Feels - Advanced */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h4 className="text-lg font-semibold text-primary">Swing Feels & Mental Keys</h4>
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">Advanced</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
                        <h5 className="font-medium text-foreground mb-2">Setup & Transition Feels</h5>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <p><strong>Address:</strong> Feel balanced weight on balls of feet, shoulders slightly ahead of ball</p>
                          <p><strong>Takeaway:</strong> Club and hands move together, maintaining spine angle</p>
                          <p><strong>Transition:</strong> Feel lower body start down while upper body completes backswing</p>
                          <p><strong>Key:</strong> Smooth acceleration, not sudden speed changes</p>
                        </div>
                      </div>
                      <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
                        <h5 className="font-medium text-foreground mb-2">Impact & Follow-Through</h5>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <p><strong>Impact:</strong> Feel like you're hitting down and through (irons) or up and through (driver)</p>
                          <p><strong>Release:</strong> Let the club release naturally, don't force rotation</p>
                          <p><strong>Finish:</strong> Balanced finish with most weight on front foot</p>
                          <p><strong>Key:</strong> Trust the swing, commit to the shot</p>
                        </div>
                      </div>
                      <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
                        <h5 className="font-medium text-foreground mb-2">Course Application</h5>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <p><strong>Pre-shot:</strong> Visualize the shot shape and landing area</p>
                          <p><strong>During swing:</strong> Focus on one key feel, not multiple thoughts</p>
                          <p><strong>Commitment:</strong> Once you start the swing, commit fully</p>
                          <p><strong>Recovery:</strong> Stay positive, focus on next shot execution</p>
                        </div>
                      </div>
                      <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
                        <h5 className="font-medium text-foreground mb-2">Practice Session Structure</h5>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <p><strong>Warm-up:</strong> 10 swings focusing on tempo and balance</p>
                          <p><strong>Technical work:</strong> 20-30 swings on priority area</p>
                          <p><strong>Integration:</strong> 10 swings combining all elements</p>
                          <p><strong>Simulation:</strong> Practice course scenarios and pressure shots</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
        
        {/* API Key Dialog */}
        <ApiKeyDialog />
      </div>
    </div>
  );
};