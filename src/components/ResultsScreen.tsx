import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowLeft, Play, ChevronDown, Target, Lightbulb, Trophy, Eye, ExternalLink, CheckCircle, AlertCircle, Home } from "lucide-react";
import { getVideoRecommendations, getTextRecommendations } from "@/utils/recommendationEngine";
import { VideoCard } from "@/components/VideoCard";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getStructuredMetrics, getMetricValue, getMetricDisplay } from '@/utils/structuredMetricsHelper';
import { MetricTile } from '@/components/MetricTile';

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
  
  // Safety check for swingData
  if (!swingData || typeof swingData !== 'object') {
    return { goodPoints: [], needsWork: [] };
  }
  
  // Get structured metrics - only new format with safety checks
  const structuredMetrics = getStructuredMetrics(swingData.structuredMetrics || swingData.structured_metrics || []);
  
  // Analyze all available metrics with ideal ranges
  const metrics = [
    { key: 'Ball Speed', name: 'Ball Speed', ideal: { min: 145, max: 180 }, unit: 'mph', goodAbove: true },
    { key: 'Smash Factor', name: 'Smash Factor', ideal: { min: 1.4, max: 1.5 }, unit: '', goodAbove: true },
    { key: 'Carry Distance', name: 'Carry Distance', ideal: { min: 200, max: 280 }, unit: 'yds', goodAbove: true },
    { key: 'Club Path', name: 'Club Path', ideal: { min: -2, max: 2 }, unit: '°', goodAbove: false },
    { key: 'Face Angle', name: 'Face Angle', ideal: { min: -2, max: 2 }, unit: '°', goodAbove: false },
    { key: 'Attack Angle', name: 'Attack Angle', ideal: { min: -2, max: 3 }, unit: '°', goodAbove: false },
    { key: 'Launch Angle', name: 'Launch Angle', ideal: { min: 12, max: 18 }, unit: '°', goodAbove: false },
    { key: 'Spin Rate', name: 'Spin Rate', ideal: { min: 2000, max: 3500 }, unit: 'rpm', goodAbove: false }
  ];

  metrics.forEach(metric => {
    const value = getMetricValue(structuredMetrics, metric.key);
    const displayValue = getMetricDisplay(structuredMetrics, metric.key);
    
    if (value !== null && !isNaN(value)) {
      const isInRange = value >= metric.ideal.min && value <= metric.ideal.max;
      const deviation = isInRange ? 0 : Math.min(
        Math.abs(value - metric.ideal.min),
        Math.abs(value - metric.ideal.max)
      );
      
      allMetrics.push({
        ...metric,
        value: displayValue || `${value}${metric.unit}`,
        numValue: value,
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
  isDemoMode?: boolean;
}

export const ResultsScreen = ({ data, onReset, isDemoMode = false }: ResultsScreenProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // All data sources now provide consistent format: { swings: [SwingDataObject], club: string }
  const swings = data.swings || [];
  const selectedClub = data.club || 'driver';
  
  if (swings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-6xl mx-auto text-center py-20">
          <p>No valid swing data found. Please try uploading your analysis again.</p>
          <Button onClick={onReset} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  const videoRecommendations = getVideoRecommendations(swings, selectedClub);
  const textRecommendations = getTextRecommendations(swings, selectedClub);
  
  // Use the first swing data for display purposes with safety check
  const swingData = swings.length > 0 ? swings[0] : {};
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  
  // Get structured metrics for the display with safety checks
  const structuredMetrics = getStructuredMetrics(swingData?.structuredMetrics || swingData?.structured_metrics || []);
  
  // Get swing summary with additional safety
  const { goodPoints, needsWork } = swingData ? getSwingSummary(swingData) : { goodPoints: [], needsWork: [] };
  
  // Filter videos based on mode
  const displayedVideos = isSimpleMode ? videoRecommendations.slice(0, 1) : videoRecommendations.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-muted">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(158,155,135,0.03),transparent_50%)]"></div>
      
      <div className="container-premium py-12">
        {/* Demo Mode CTA */}
        {isDemoMode && (
          <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10 mb-16">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    🎯 Love Your Results? Save Your Progress!
                  </h3>
                  <p className="text-muted-foreground">
                    Create an account to save your swing data, track your progress over time, 
                    and get a personalized dashboard showing where you're improving.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => window.location.href = '/auth'}
                    size="lg"
                    className="whitespace-nowrap"
                  >
                    Create Account
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/auth'}
                    variant="outline"
                    size="lg"
                    className="whitespace-nowrap"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <Button 
                onClick={onReset} 
                variant="outline" 
                className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl border-border/60 hover:border-border text-premium-muted hover:text-premium cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Analyze Another Photo
              </Button>
              {user && (
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  variant="outline" 
                  className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl border-border/60 hover:border-border text-premium-muted hover:text-premium cursor-pointer"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
              )}
            </div>
            <img 
              src="/lovable-uploads/5ee4c388-2e1d-4fb1-aa32-fa74da0d32e4.png" 
              alt="Scratch Golf Club Logo" 
              className="h-10 w-auto opacity-80"
            />
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-light text-premium mb-4 leading-tight">
              Your <span className="gradient-text-premium">Personalized</span> Analysis
            </h1>
            <p className="text-xl text-premium-muted">Based on your TrackMan data</p>
          </div>
        </div>

        {/* Quick Summary Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Good Points */}
          <div className="premium-card p-8 border-0 bg-gradient-to-br from-green-50/80 to-green-100/40 dark:from-green-950/40 dark:to-green-900/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-medium text-premium">These Numbers Look Great</h3>
            </div>
            
            {goodPoints.length > 0 ? (
              <div className="space-y-4">
                {goodPoints.slice(0, 1).map((point, index) => (
                  <div key={index} className="p-4 bg-green-100/60 dark:bg-green-900/30 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-green-800 dark:text-green-200 mb-1">{point.name}</div>
                        <div className="text-sm text-green-700 dark:text-green-300">{point.reason}</div>
                      </div>
                      <div className="text-xl font-medium text-green-800 dark:text-green-200">{point.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-green-700 dark:text-green-300 text-premium-muted">Upload more data to see your strengths!</p>
            )}
          </div>

          {/* Areas for Improvement */}
          <div className="premium-card p-8 border-0 bg-gradient-to-br from-amber-50/80 to-amber-100/40 dark:from-amber-950/40 dark:to-amber-900/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-medium text-premium">These Numbers Need Work</h3>
            </div>
            
            {needsWork.length > 0 ? (
              <div className="space-y-4">
                {needsWork.slice(0, 1).map((point, index) => (
                  <div key={index} className="p-4 bg-amber-100/60 dark:bg-amber-900/30 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-amber-800 dark:text-amber-200 mb-1">{point.name}</div>
                        <div className="text-sm text-amber-700 dark:text-amber-300">{point.reason}</div>
                      </div>
                      <div className="text-xl font-medium text-amber-800 dark:text-amber-200">{point.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-amber-700 dark:text-amber-300 text-premium-muted">Your swing metrics look solid overall!</p>
            )}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="premium-card p-8 mb-16">
          <div className="flex flex-col items-center space-y-8">
            <h3 className="text-xl font-medium text-premium">Report Detail Level</h3>
            <div className="relative bg-gradient-to-r from-surface to-surface-muted p-2 rounded-2xl shadow-card border border-border/40">
              <div 
                className={`absolute top-2 bottom-2 bg-gradient-to-r from-primary to-primary/90 rounded-xl shadow-premium transition-all duration-500 ease-out transform ${
                  isSimpleMode 
                    ? 'left-2 right-[50%] translate-x-0' 
                    : 'left-[50%] right-2 translate-x-0'
                }`}
              />
              <div className="relative z-10 flex w-full">
                <button
                  onClick={() => setIsSimpleMode(true)}
                  className={`flex-1 px-12 py-4 text-base font-medium transition-all duration-300 rounded-xl relative z-20 ${
                    isSimpleMode 
                      ? 'text-primary-foreground' 
                      : 'text-premium-muted hover:text-premium'
                  }`}
                >
                  Simple
                </button>
                <button
                  onClick={() => setIsSimpleMode(false)}
                  className={`flex-1 px-12 py-4 text-base font-medium transition-all duration-300 rounded-xl relative z-20 ${
                    !isSimpleMode 
                      ? 'text-primary-foreground' 
                      : 'text-premium-muted hover:text-premium'
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>
            <div className="text-center space-y-3 max-w-2xl">
              <div className="text-base text-premium-muted">
                <strong className="text-premium">Simple:</strong> Get 1 key video and concise analysis highlights.
              </div>
              <div className="text-base text-premium-muted">
                <strong className="text-premium">Advanced:</strong> Access 2-3 videos with detailed technical breakdown and comprehensive recommendations.
              </div>
            </div>
          </div>
        </div>

        {/* Video Recommendations */}
        <div className="premium-card p-10 mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Play className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-medium text-premium">
                Your {isSimpleMode ? 'Simple' : 'Advanced'} Lesson Plan
              </h2>
              <p className="text-premium-muted">
                {isSimpleMode ? '1' : displayedVideos.length} video{displayedVideos.length !== 1 ? 's' : ''} tailored to your swing data
              </p>
            </div>
          </div>
          
          <div className="space-y-8">
            {displayedVideos.map((video, index) => (
              <div key={index} className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-blue-50/80 to-blue-100/40 dark:from-blue-950/40 dark:to-blue-900/20 rounded-2xl border border-blue-200/60 dark:border-blue-800/60">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3 text-lg">Why we're recommending this video:</h4>
                  <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
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
            <div className="text-center py-16 text-premium-muted">
              <Play className="h-16 w-16 mx-auto mb-6 opacity-40" />
              <p className="text-lg">No specific video recommendations available for your current data.</p>
            </div>
          )}
        </div>

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

        {/* Individual Metric Tiles */}
        <Card className="mt-8 shadow-lg border-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              Swing Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {structuredMetrics.map((metric, index) => (
                <MetricTile key={index} metric={metric} />
              ))}
            </div>
            {structuredMetrics.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No structured metrics available for this swing.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
};