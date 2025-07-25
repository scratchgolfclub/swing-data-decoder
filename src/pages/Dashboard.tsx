import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  TrendingUp, 
  Target, 
  LogOut, 
  User, 
  Trophy, 
  AlertTriangle, 
  BookOpen, 
  Brain, 
  Play,
  CheckCircle,
  Eye,
  Stethoscope
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProgressModal from '@/components/ProgressModal';
import SwingHistoryList from '@/components/SwingHistoryList';
import { getVideoRecommendations, getTextRecommendations } from '@/utils/recommendationEngine';

interface SwingData {
  id: string;
  session_name: string;
  club_type: string;
  initial_metrics: any;
  swing_data_non_baseline: any;
  coaching_notes: string;
  swing_score: number;
  is_baseline: boolean;
  created_at: string;
  trackman_image_url: string;
}

interface ProgressData {
  id: string;
  overall_score: number;
  progress_summary: string;
  strengths: string[];
  improvement_areas: string[];
  notes: string;
  created_at: string;
}

interface VideoView {
  video_url: string;
  video_title: string;
  watched_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [swingData, setSwingData] = useState<SwingData[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [videoViews, setVideoViews] = useState<VideoView[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Load swing data
      const { data: swings, error: swingError } = await (supabase as any)
        .from('swing_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (swingError) {
        console.error('Error loading swing data:', swingError);
        setSwingData([]);
      } else {
        setSwingData(swings as SwingData[] || []);
      }

      // Load progress data
      const { data: progress, error: progressError } = await (supabase as any)
        .from('progress_tracker')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (progressError) {
        console.error('Error loading progress data:', progressError);
        setProgressData([]);
      } else {
        setProgressData(progress as ProgressData[] || []);
      }

      // Load video views
      const { data: views, error: viewsError } = await (supabase as any)
        .from('user_video_views')
        .select('*')
        .eq('user_id', user.id);

      if (viewsError) {
        console.error('Error loading video views:', viewsError);
        setVideoViews([]);
      } else {
        setVideoViews(views as VideoView[] || []);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    navigate('/analyze');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleVideoClick = async (videoUrl: string, videoTitle: string) => {
    // Track video view
    try {
      await (supabase as any)
        .from('user_video_views')
        .upsert({
          user_id: user?.id,
          video_url: videoUrl,
          video_title: videoTitle,
          watched_at: new Date().toISOString()
        });
      
      // Refresh video views
      loadUserData();
    } catch (error) {
      console.error('Error tracking video view:', error);
    }
    
    // Open video in new tab
    window.open(videoUrl, '_blank');
  };

  const getLatestSwingMetrics = () => {
    const latestSwing = swingData[0];
    if (!latestSwing) {
      console.log('No latest swing found');
      return null;
    }
    
    const metrics = latestSwing.is_baseline 
      ? latestSwing.initial_metrics 
      : latestSwing.swing_data_non_baseline;
    
    console.log('Latest swing metrics:', {
      isBaseline: latestSwing.is_baseline,
      metrics: metrics,
      hasTrackManCombine: !!metrics?.TrackManCombine
    });
    
    return metrics;
  };

  const analyzeStrengthAndWeakness = (metrics: any) => {
    console.log('Analyzing strength and weakness with metrics:', metrics);
    
    if (!metrics) {
      console.log('No metrics provided');
      return { strength: null, weakness: null };
    }

    // Check both possible data structures
    const data = metrics.TrackManCombine || metrics;
    console.log('Using data:', data);
    
    if (!data || typeof data !== 'object') {
      console.log('No valid data found');
      return { strength: null, weakness: null };
    }
    const idealRanges = {
      'Club Speed': { min: 95, max: 115, weight: 0.2, unit: ' mph' },
      'Ball Speed': { min: 140, max: 165, weight: 0.2, unit: ' mph' },
      'Smash Factor': { min: 1.45, max: 1.52, weight: 0.15, unit: '' },
      'Launch Angle': { min: 8, max: 15, weight: 0.15, unit: '°' },
      'Club Face': { min: -2, max: 2, weight: 0.3, unit: '°' },
      'Attack Angle': { min: -1, max: 3, weight: 0.2, unit: '°' },
      'Club Path': { min: -2, max: 2, weight: 0.2, unit: '°' }
    };

    const scores = Object.entries(idealRanges).map(([key, range]) => {
      const rawValue = data[key];
      if (!rawValue) return { key, value: 0, score: 0, weight: range.weight, unit: range.unit };
      
      const value = parseFloat(rawValue.toString().replace(/[^\d.-]/g, '') || '0');
      let score = 0;
      
      if (value >= range.min && value <= range.max) {
        score = 100;
      } else if (value < range.min) {
        score = Math.max(0, 100 - ((range.min - value) / range.min) * 100);
      } else {
        score = Math.max(0, 100 - ((value - range.max) / range.max) * 100);
      }
      
      return { key, value, score, weight: range.weight, unit: range.unit };
    }).filter(item => item.value !== 0);

    if (scores.length === 0) return { strength: null, weakness: null };

    const bestMetric = scores.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    const worstMetric = scores.reduce((worst, current) => 
      current.score < worst.score ? current : worst
    );

    const getDescription = (key: string, value: number, isStrength: boolean) => {
      switch (key) {
        case 'Club Speed':
          return isStrength 
            ? `Great club speed! This generates good distance.`
            : `Work on generating more club speed through better sequence.`;
        case 'Ball Speed':
          return isStrength 
            ? `Excellent ball speed - you're maximizing energy transfer!`
            : `Focus on solid contact to increase ball speed.`;
        case 'Smash Factor':
          return isStrength 
            ? `Perfect contact efficiency - you're hitting it pure!`
            : `Work on center face contact to improve efficiency.`;
        case 'Launch Angle':
          return isStrength 
            ? `Ideal launch angle for maximum carry distance!`
            : `Adjust your angle of attack for optimal trajectory.`;
        case 'Club Face':
          return isStrength 
            ? `Outstanding face control - this is what tour players strive for!`
            : `Focus on square face at impact for straighter shots.`;
        case 'Attack Angle':
          return isStrength 
            ? `Perfect attack angle for solid contact!`
            : `Too steep, work on shallow approach for better contact.`;
        case 'Club Path':
          return isStrength 
            ? `Great swing path for straight shots!`
            : `Work on swing path for more consistent direction.`;
        default:
          return isStrength ? 'Great execution!' : 'Area for improvement.';
      }
    };

    return {
      strength: {
        metric: bestMetric.key,
        value: `${bestMetric.value}${bestMetric.unit}`,
        description: getDescription(bestMetric.key, bestMetric.value, true)
      },
      weakness: {
        metric: worstMetric.key,
        value: `${worstMetric.value}${worstMetric.unit}`,
        description: getDescription(worstMetric.key, worstMetric.value, false)
      }
    };
  };

  const getRecommendations = () => {
    if (!swingData.length) return { drills: [], feels: [], videos: [] };

    const latestSwing = swingData[0];
    const metrics = getLatestSwingMetrics();
    if (!metrics) return { drills: [], feels: [], videos: [] };

    // Create a combined swing object for the recommendation engine
    const combinedSwing = {
      ...latestSwing,
      ...metrics
    };

    // Get text recommendations and parse drills/feels
    const textRecs = getTextRecommendations([combinedSwing], latestSwing.club_type);
    
    // More robust parsing for drills and feels
    const drillsSection = textRecs.match(/(?:Recommended drills|Practice Tips|Drills to Try):(.*?)(?=\n\n|\*\*|Swing feels|Remember|$)/is);
    const feelsSection = textRecs.match(/(?:Swing feels|Feel thoughts|Key feels):(.*?)(?=\n\n|\*\*|Remember|Goal|$)/is);
    
    // Extract bullet points or numbered items with enhanced details
    const extractDetailedItems = (text: string, type: 'drills' | 'feels') => {
      if (!text) return getDefaultItems(type);
      
      const items = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => 
          line.startsWith('•') || 
          line.startsWith('-') || 
          line.startsWith('*') ||
          /^\d+\./.test(line)
        )
        .map(line => line.replace(/^[•\-*\d.]\s*/, '').trim())
        .filter(line => line.length > 10)
        .slice(0, 3);
      
      return items.length > 0 ? items.map(item => enhanceItem(item, type)) : getDefaultItems(type);
    };

    const enhanceItem = (item: string, type: 'drills' | 'feels') => {
      if (type === 'drills') {
        // Add more detailed drill instructions
        if (item.toLowerCase().includes('alignment')) {
          return `${item}. Place alignment sticks on the ground - one pointing at your target, another parallel to it for your feet. Practice hitting balls while staying aligned with these guides. This helps develop consistent setup and swing path.`;
        }
        if (item.toLowerCase().includes('tempo')) {
          return `${item}. Count "1-2-3" during your swing: 1 for takeaway, 2 for top of backswing, 3 for impact. Practice this rhythm to develop consistent timing and avoid rushing your downswing.`;
        }
        if (item.toLowerCase().includes('setup')) {
          return `${item}. Spend 2-3 minutes before each practice session going through your setup checklist: grip pressure, stance width, ball position, and posture. Consistency here leads to better swing consistency.`;
        }
        return `${item}. Focus on quality repetitions rather than quantity - 10 focused swings are better than 50 mindless ones.`;
      } else {
        // Add more detailed feel descriptions
        if (item.toLowerCase().includes('tempo') || item.toLowerCase().includes('smooth')) {
          return `${item}. Think of swinging at 80% effort while maintaining balance. The feeling should be smooth and controlled, like you're swinging underwater. Good tempo creates better sequencing and more consistent contact.`;
        }
        if (item.toLowerCase().includes('head') || item.toLowerCase().includes('behind')) {
          return `${item}. Feel like your head stays in place while your body rotates around it. This helps maintain your spine angle and promotes better weight transfer through the swing.`;
        }
        if (item.toLowerCase().includes('face') || item.toLowerCase().includes('square')) {
          return `${item}. Imagine the clubface is a clock face pointing at 6 o'clock at address and impact. This mental image helps maintain square contact for straighter shots.`;
        }
        return `${item}. Trust this feeling during practice and focus on recreating it consistently.`;
      }
    };

    const getDefaultItems = (type: 'drills' | 'feels') => {
      if (type === 'drills') {
        return [
          "Alignment Stick Drill. Place alignment sticks on the ground - one pointing at your target, another parallel to it for your feet. Practice hitting balls while staying aligned with these guides to develop consistent setup and swing path.",
          "Tempo Training. Count '1-2-3' during your swing: 1 for takeaway, 2 for top of backswing, 3 for impact. Practice this rhythm to develop consistent timing and avoid rushing your downswing.",
          "Setup Routine Practice. Spend 2-3 minutes before each session going through your setup checklist: grip pressure, stance width, ball position, and posture. Consistency here leads to better swing consistency."
        ];
      } else {
        return [
          "Smooth Tempo Feel. Think of swinging at 80% effort while maintaining balance. The feeling should be smooth and controlled, like you're swinging underwater for better sequencing and contact.",
          "Stay Behind the Ball. Feel like your head stays in place while your body rotates around it. This helps maintain your spine angle and promotes better weight transfer through the swing.",
          "Square Clubface Feel. Imagine the clubface is a clock face pointing at 6 o'clock at address and impact. This mental image helps maintain square contact for straighter shots."
        ];
      }
    };

    const drills = extractDetailedItems(drillsSection?.[1] || '', 'drills');
    const feels = extractDetailedItems(feelsSection?.[1] || '', 'feels');

    // Get video recommendations
    const videoRecs = getVideoRecommendations([combinedSwing], latestSwing.club_type).slice(0, 3);

    return { 
      drills,
      feels,
      videos: videoRecs 
    };
  };

  const latestSwing = swingData[0];
  const baselineSwing = swingData.find(swing => swing.is_baseline);
  const latestProgress = progressData[0];
  const latestMetrics = getLatestSwingMetrics();
  const analysis = latestMetrics ? analyzeStrengthAndWeakness(latestMetrics) : null;
  const recommendations = getRecommendations();

  // Debug logging
  console.log('Dashboard Debug:', {
    hasLatestSwing: !!latestSwing,
    latestMetrics: latestMetrics,
    analysis: analysis,
    swingDataLength: swingData.length
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold gradient-text-premium">Scratch Golf</h1>
            <Badge variant="secondary">Dashboard</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section with New Analysis Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
            <p className="text-muted-foreground">Track your golf swing improvement over time.</p>
          </div>
          <Button 
            onClick={handleNewAnalysis}
            className="h-12 px-6"
            size="lg"
          >
            <Upload className="h-5 w-5 mr-2" />
            New Swing Analysis
          </Button>
        </div>

        {/* Top Stats Row - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-muted/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Total Swings</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold">{swingData.length}</div>
              <p className="text-xs text-muted-foreground">Analyzed swings</p>
            </CardContent>
          </Card>

          <Card className="border-muted/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold">{latestSwing?.swing_score || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Out of 100</p>
            </CardContent>
          </Card>

          <Card className="border-muted/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Progress Tracker</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-3">
              {latestSwing && baselineSwing ? (
                <Button 
                  onClick={() => setShowProgressModal(true)}
                  size="sm"
                  variant="secondary"
                  className="w-full h-8"
                >
                  View Report
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {swingData.length === 0 ? "Upload first swing" : "Need 2+ swings"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Strength & Weakness Analysis */}
        {latestSwing && analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Biggest Strength */}
            {analysis.strength && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    Biggest Strength
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {analysis.strength.metric}: {analysis.strength.value}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysis.strength.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Biggest Weakness */}
            {analysis.weakness && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                    Biggest Weakness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {analysis.weakness.metric}: {analysis.weakness.value}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {analysis.weakness.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {latestSwing && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-green-600" />
                Your Practice Prescription
              </CardTitle>
              <CardDescription>
                Personalized recommendations based on your latest swing analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" defaultValue="drills" className="w-full">
                <AccordionItem value="drills" className="border-b border-muted/40">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium">Your Drills</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-4">
                      {recommendations.drills.map((drill, index) => (
                        <div key={index} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                              {index + 1}
                            </span>
                            <p className="text-sm leading-relaxed">{drill}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="feels" className="border-b border-muted/40">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center">
                      <Brain className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="font-medium">Your Feels</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-4">
                      {recommendations.feels.map((feel, index) => (
                        <div key={index} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                              {index + 1}
                            </span>
                            <p className="text-sm leading-relaxed">{feel}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="videos">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center">
                      <Play className="h-4 w-4 mr-2 text-green-500" />
                      <span className="font-medium">Your Videos</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-4">
                      {recommendations.videos.map((video, index) => {
                        const isWatched = videoViews.some(view => view.video_url === video.url);
                        return (
                          <div key={index} className="p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 mr-4">
                                <div className="flex items-center mb-2">
                                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                    {index + 1}
                                  </span>
                                  <h4 className="text-sm font-medium flex items-center">
                                    {video.title}
                                    {isWatched && (
                                      <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                                    )}
                                  </h4>
                                </div>
                                <p className="text-xs text-muted-foreground ml-9 leading-relaxed">
                                  {video.reason}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant={isWatched ? "secondary" : "default"}
                                onClick={() => handleVideoClick(video.url, video.title)}
                                className="flex-shrink-0"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                {isWatched ? 'Rewatch' : 'Watch'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Swing History */}
        <SwingHistoryList swingData={swingData} onDataUpdate={loadUserData} />
      </div>

      {/* Progress Modal */}
      {showProgressModal && latestSwing && baselineSwing && (
        <ProgressModal
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          latestSwing={latestSwing}
          baselineSwing={baselineSwing}
          progressData={latestProgress}
        />
      )}
    </div>
  );
};

export default Dashboard;