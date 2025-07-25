import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Eye
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
    if (!latestSwing) return null;
    
    return latestSwing.is_baseline 
      ? latestSwing.initial_metrics 
      : latestSwing.swing_data_non_baseline;
  };

  const analyzeStrengthAndWeakness = (metrics: any) => {
    if (!metrics || !metrics.TrackManCombine) return { strength: null, weakness: null };

    const data = metrics.TrackManCombine;
    const idealRanges = {
      'Club Speed': { min: 95, max: 115, weight: 0.2 },
      'Ball Speed': { min: 140, max: 165, weight: 0.2 },
      'Smash Factor': { min: 1.45, max: 1.52, weight: 0.15 },
      'Launch Angle': { min: 8, max: 15, weight: 0.15 },
      'Club Face': { min: -2, max: 2, weight: 0.3 }
    };

    const scores = Object.entries(idealRanges).map(([key, range]) => {
      const value = parseFloat(data[key]?.replace(/[^\d.-]/g, '') || '0');
      let score = 0;
      
      if (value >= range.min && value <= range.max) {
        score = 100;
      } else if (value < range.min) {
        score = Math.max(0, 100 - ((range.min - value) / range.min) * 100);
      } else {
        score = Math.max(0, 100 - ((value - range.max) / range.max) * 100);
      }
      
      return { key, value, score, weight: range.weight };
    });

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
        default:
          return isStrength ? 'Great execution!' : 'Area for improvement.';
      }
    };

    return {
      strength: {
        metric: bestMetric.key,
        value: bestMetric.value,
        description: getDescription(bestMetric.key, bestMetric.value, true)
      },
      weakness: {
        metric: worstMetric.key,
        value: worstMetric.value,
        description: getDescription(worstMetric.key, worstMetric.value, false)
      }
    };
  };

  const getRecommendations = () => {
    if (!swingData.length) return { drills: [], feels: [], videos: [] };

    const latestSwing = swingData[0];
    const metrics = getLatestSwingMetrics();
    if (!metrics) return { drills: [], feels: [], videos: [] };

    // Get text recommendations and parse drills/feels
    const textRecs = getTextRecommendations([{ ...latestSwing, ...metrics }], latestSwing.club_type);
    
    // Extract drills and feels from text recommendations
    const drillsMatch = textRecs.match(/Recommended drills:(.*?)(?=Swing feels:|$)/s);
    const feelsMatch = textRecs.match(/Swing feels:(.*?)(?=Remember:|$)/s);
    
    const drills = drillsMatch ? drillsMatch[1].split('\n').filter(line => line.trim().startsWith('-')).slice(0, 3) : [];
    const feels = feelsMatch ? feelsMatch[1].split('\n').filter(line => line.trim().startsWith('-')).slice(0, 3) : [];

    // Get video recommendations
    const videoRecs = getVideoRecommendations([{ ...latestSwing, ...metrics }], latestSwing.club_type).slice(0, 3);

    return { drills, feels, videos: videoRecs };
  };

  const latestSwing = swingData[0];
  const baselineSwing = swingData.find(swing => swing.is_baseline);
  const latestProgress = progressData[0];
  const latestMetrics = getLatestSwingMetrics();
  const analysis = latestMetrics ? analyzeStrengthAndWeakness(latestMetrics) : null;
  const recommendations = getRecommendations();

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

        {/* Quick Stats - Removed Last Session */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Swings</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{swingData.length}</div>
              <p className="text-xs text-muted-foreground">
                Analyzed swings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestSwing?.swing_score || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of 100
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Widget Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          
          {/* Progress Tracker - Simplified */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracker</CardTitle>
              <CardDescription>
                View your improvement over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {latestSwing && baselineSwing ? (
                <Button 
                  onClick={() => setShowProgressModal(true)}
                  className="w-full"
                  variant="secondary"
                >
                  View Progress Report
                </Button>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    {swingData.length === 0 
                      ? "Upload your first swing to start tracking"
                      : "Need at least 2 swings to compare"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Biggest Strength */}
          {analysis?.strength && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Biggest Strength
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {analysis.strength.metric}: {analysis.strength.value}°
                </div>
                <p className="text-sm text-muted-foreground">
                  {analysis.strength.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Biggest Weakness */}
          {analysis?.weakness && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                  Biggest Weakness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {analysis.weakness.metric}: {analysis.weakness.value}°
                </div>
                <p className="text-sm text-muted-foreground">
                  {analysis.weakness.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Your Drills */}
          {recommendations.drills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                  Your Drills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.drills.map((drill, index) => (
                    <li key={index} className="text-sm flex items-start">
                      <span className="mr-2">•</span>
                      <span>{drill.replace(/^-\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Your Feels */}
          {recommendations.feels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-500" />
                  Your Feels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.feels.map((feel, index) => (
                    <li key={index} className="text-sm flex items-start">
                      <span className="mr-2">•</span>
                      <span>{feel.replace(/^-\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Your Videos */}
          {recommendations.videos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2 text-green-500" />
                  Your Videos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.videos.map((video, index) => {
                  const isWatched = videoViews.some(view => view.video_url === video.url);
                  return (
                    <div key={index} className="flex items-start justify-between">
                      <div className="flex-1 mr-3">
                        <h4 className="text-sm font-medium mb-1 flex items-center">
                          {video.title}
                          {isWatched && (
                            <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {video.reason}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={isWatched ? "secondary" : "default"}
                        onClick={() => handleVideoClick(video.url, video.title)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

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