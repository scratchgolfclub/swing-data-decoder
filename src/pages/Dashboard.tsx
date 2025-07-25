import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  BookOpen, 
  Brain, 
  Play,
  CheckCircle,
  Stethoscope,
  ArrowRight,
  Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProgressModal from '@/components/ProgressModal';
import SwingHistoryList from '@/components/SwingHistoryList';
import { BadgeSection } from '@/components/BadgeSection';
import { BadgeNotificationManager } from '@/components/BadgeNotification';
import { useBadges } from '@/hooks/useBadges';
import { getVideoRecommendations, getTextRecommendations } from '@/utils/recommendationEngine';
import Header from '@/components/Header';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [swingData, setSwingData] = useState<SwingData[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [videoViews, setVideoViews] = useState<VideoView[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedClubCategory, setSelectedClubCategory] = useState<string>('all');
  
  // Badge system integration
  const { 
    badgeProgress, 
    newBadges, 
    checkForNewBadges, 
    dismissBadgeNotification 
  } = useBadges();

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Check for new badges after data loads
  useEffect(() => {
    if (user && swingData.length > 0) {
      checkForNewBadges();
    }
  }, [user, swingData, checkForNewBadges]);

  const loadUserData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Load swing data
      const { data: swings, error: swingError } = await supabase
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
      const { data: progress, error: progressError } = await supabase
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
      const { data: views, error: viewsError } = await supabase
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

  const handleVideoClick = async (videoUrl: string, videoTitle: string) => {
    // Track video view
    try {
      await supabase
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

  // Helper function to match club type to category
  const getClubCategory = (clubType: string): string => {
    const type = clubType.toLowerCase();
    
    if (type.includes('wedge') || type.includes('sw') || type.includes('pw') || type.includes('gap') || type.includes('lob')) {
      return 'wedges';
    }
    if (type.includes('iron') || /[4-9]/.test(type)) {
      return 'irons';
    }
    if (type.includes('driver') || type.includes('1w')) {
      return 'driver';
    }
    if (type.includes('wood') || type.includes('hybrid') || type.includes('rescue')) {
      return 'woods';
    }
    
    return 'all'; // default category
  };

  // Filter swing data based on selected club category
  const getFilteredSwingData = () => {
    if (selectedClubCategory === 'all') {
      return swingData;
    }
    
    return swingData.filter(swing => {
      const clubCategory = getClubCategory(swing.club_type);
      return clubCategory === selectedClubCategory;
    });
  };

  const getLatestSwingMetrics = () => {
    const filteredData = getFilteredSwingData();
    const latestSwing = filteredData[0];
    if (!latestSwing) {
      return null;
    }
    
    const metrics = latestSwing.is_baseline 
      ? latestSwing.initial_metrics 
      : latestSwing.swing_data_non_baseline;
    
    return metrics;
  };

  const analyzeStrengthAndWeakness = (metrics: any) => {
    if (!metrics) {
      return { strength: null, weakness: null };
    }

    const data = metrics;
    
    if (!data || typeof data !== 'object') {
      return { strength: null, weakness: null };
    }

    // Define club-specific ideal ranges
    const getIdealRanges = () => {
      const baseRanges = {
        'clubSpeed': { min: 85, max: 105, unit: ' mph', label: 'Club Speed' },
        'ballSpeed': { min: 120, max: 150, unit: ' mph', label: 'Ball Speed' },
        'smashFactor': { min: 1.40, max: 1.50, unit: '', label: 'Smash Factor' },
        'launchAngle': { min: 12, max: 18, unit: '°', label: 'Launch Angle' },
        'faceAngle': { min: -2, max: 2, unit: '°', label: 'Face Angle' },
        'clubPath': { min: -2, max: 2, unit: '°', label: 'Club Path' },
        'faceToPath': { min: -2, max: 2, unit: '°', label: 'Face to Path' },
        'spinRate': { min: 5000, max: 7000, unit: ' rpm', label: 'Spin Rate' }
      };

      // Adjust ranges based on club category
      switch (selectedClubCategory) {
        case 'driver':
          return {
            ...baseRanges,
            'clubSpeed': { min: 95, max: 115, unit: ' mph', label: 'Club Speed' },
            'ballSpeed': { min: 140, max: 170, unit: ' mph', label: 'Ball Speed' },
            'launchAngle': { min: 10, max: 15, unit: '°', label: 'Launch Angle' },
            'spinRate': { min: 2000, max: 3000, unit: ' rpm', label: 'Spin Rate' }
          };
        case 'woods':
          return {
            ...baseRanges,
            'clubSpeed': { min: 85, max: 105, unit: ' mph', label: 'Club Speed' },
            'ballSpeed': { min: 130, max: 160, unit: ' mph', label: 'Ball Speed' },
            'launchAngle': { min: 12, max: 18, unit: '°', label: 'Launch Angle' },
            'spinRate': { min: 3000, max: 4500, unit: ' rpm', label: 'Spin Rate' }
          };
        case 'irons':
          return {
            ...baseRanges,
            'clubSpeed': { min: 75, max: 95, unit: ' mph', label: 'Club Speed' },
            'ballSpeed': { min: 110, max: 140, unit: ' mph', label: 'Ball Speed' },
            'launchAngle': { min: 15, max: 25, unit: '°', label: 'Launch Angle' },
            'spinRate': { min: 6000, max: 8000, unit: ' rpm', label: 'Spin Rate' }
          };
        case 'wedges':
          return {
            ...baseRanges,
            'clubSpeed': { min: 65, max: 85, unit: ' mph', label: 'Club Speed' },
            'ballSpeed': { min: 90, max: 120, unit: ' mph', label: 'Ball Speed' },
            'launchAngle': { min: 20, max: 35, unit: '°', label: 'Launch Angle' },
            'spinRate': { min: 8000, max: 12000, unit: ' rpm', label: 'Spin Rate' }
          };
        default:
          return baseRanges;
      }
    };

    const idealRanges = getIdealRanges();

    const scores = Object.entries(idealRanges).map(([key, range]) => {
      const rawValue = data[key];
      if (!rawValue) return null;
      
      // Parse numeric value from string (remove units)
      const value = parseFloat(rawValue.toString().replace(/[^\d.-]/g, ''));
      if (isNaN(value)) return null;
      
      let score = 0;
      let distanceFromIdeal = 0;
      
      if (value >= range.min && value <= range.max) {
        const center = (range.min + range.max) / 2;
        const rangeSize = range.max - range.min;
        distanceFromIdeal = Math.abs(value - center) / rangeSize;
        score = 100 - (distanceFromIdeal * 20);
      } else if (value < range.min) {
        distanceFromIdeal = (range.min - value) / range.min;
        score = Math.max(0, 100 - (distanceFromIdeal * 100));
      } else {
        distanceFromIdeal = (value - range.max) / range.max;
        score = Math.max(0, 100 - (distanceFromIdeal * 100));
      }
      
      return { 
        key: range.label, 
        value, 
        score, 
        unit: range.unit,
        distanceFromIdeal,
        inIdealRange: value >= range.min && value <= range.max
      };
    }).filter(item => item !== null);

    if (scores.length === 0) return { strength: null, weakness: null };

    // Find best and worst metrics
    const bestMetric = scores.reduce((best, current) => {
      if (current.inIdealRange && !best.inIdealRange) return current;
      if (!current.inIdealRange && best.inIdealRange) return best;
      return current.score > best.score ? current : best;
    });

    const worstMetric = scores.reduce((worst, current) => {
      if (!current.inIdealRange && worst.inIdealRange) return current;
      if (current.inIdealRange && !worst.inIdealRange) return worst;
      return current.score < worst.score ? current : worst;
    });

    const getDescription = (metric: any, isStrength: boolean) => {
      const { key, inIdealRange } = metric;
      
      if (isStrength) {
        if (inIdealRange) {
          switch (key) {
            case 'Club Speed':
              return `Excellent club speed! You're generating great power for distance.`;
            case 'Ball Speed':
              return `Outstanding ball speed - perfect energy transfer!`;
            case 'Smash Factor':
              return `Perfect contact efficiency - you're hitting it pure!`;
            case 'Launch Angle':
              return `Ideal launch angle for maximum carry distance!`;
            case 'Face Angle':
              return `Outstanding face control - this is what tour players strive for!`;
            case 'Club Path':
              return `Great swing path for straight, consistent shots!`;
            case 'Face to Path':
              return `Excellent face-to-path relationship for straight ball flight!`;
            case 'Spin Rate':
              return `Perfect spin rate for optimal ball flight and control!`;
            default:
              return `This metric is in the ideal range - great execution!`;
          }
        } else {
          return `Your best performing metric - keep building on this strength!`;
        }
      } else {
        switch (key) {
          case 'Club Speed':
            return `Work on generating more club speed through better sequence and rotation.`;
          case 'Ball Speed':
            return `Focus on solid contact and center face hits to increase ball speed.`;
          case 'Smash Factor':
            return `Work on center face contact to improve efficiency and distance.`;
          case 'Launch Angle':
            return `Adjust your angle of attack and ball position for optimal trajectory.`;
          case 'Face Angle':
            return `Focus on square face at impact for straighter shots.`;
          case 'Club Path':
            return `Work on swing path for more consistent direction and ball flight.`;
          case 'Face to Path':
            return `Focus on squaring the clubface relative to your swing path.`;
          case 'Spin Rate':
            return `Work on strike and angle of attack to optimize spin rate.`;
          default:
            return `This is your biggest area for improvement - focus here in practice.`;
        }
      }
    };

    return {
      strength: {
        metric: bestMetric.key,
        value: `${bestMetric.value}${bestMetric.unit}`,
        description: getDescription(bestMetric, true)
      },
      weakness: {
        metric: worstMetric.key,
        value: `${worstMetric.value}${worstMetric.unit}`,
        description: getDescription(worstMetric, false)
      }
    };
  };

  const getRecommendations = () => {
    const filteredData = getFilteredSwingData();
    if (!filteredData.length) return { drills: [], feels: [], videos: [] };

    const latestSwing = filteredData[0];
    const metrics = getLatestSwingMetrics();
    if (!metrics) return { drills: [], feels: [], videos: [] };

    // Create a combined swing object for the recommendation engine
    const combinedSwing = {
      ...latestSwing,
      ...metrics
    };

    // Get text recommendations and parse drills/feels
    const textRecs = getTextRecommendations([combinedSwing], latestSwing.club_type);
    
    // Get video recommendations
    const videoRecs = getVideoRecommendations([combinedSwing], latestSwing.club_type).slice(0, 3);

    // Extract detailed items with defaults
    const drills = [
      "Alignment Stick Drill: Place alignment sticks on the ground for consistent setup and swing path.",
      "Tempo Training: Count '1-2-3' during your swing to develop consistent timing.",
      "Setup Routine Practice: Focus on grip pressure, stance width, and ball position."
    ];

    const feels = [
      "Smooth Tempo Feel: Swing at 80% effort while maintaining balance for better sequencing.",
      "Stay Behind the Ball: Keep your head stable while your body rotates around it.",
      "Square Clubface Feel: Visualize the clubface pointing at 6 o'clock at impact."
    ];

    return { 
      drills,
      feels,
      videos: videoRecs 
    };
  };

  // Get filtered data for current club category
  const filteredSwingData = getFilteredSwingData();
  const latestSwing = filteredSwingData[0];
  const baselineSwing = filteredSwingData.find(swing => swing.is_baseline);
  const latestProgress = progressData[0];
  const latestMetrics = getLatestSwingMetrics();
  const analysis = latestMetrics ? analyzeStrengthAndWeakness(latestMetrics) : null;
  const recommendations = getRecommendations();

  // Limit swing history to last 5 swings
  const limitedSwingData = filteredSwingData.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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

        {/* Club Category Selection */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setSelectedClubCategory('all')}
              className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all ${
                selectedClubCategory === 'all' 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <img 
                src="/lovable-uploads/8a0a0e9f-0b6f-4cf8-821e-369fa9e4f703.png" 
                alt="All Clubs" 
                className="h-8 w-8"
              />
              <span className="text-sm font-medium">All Clubs</span>
            </button>
            
            <button
              onClick={() => setSelectedClubCategory('wedges')}
              className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all ${
                selectedClubCategory === 'wedges' 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <img 
                src="/lovable-uploads/97faaec3-4379-4d26-bbf2-27f2530baac8.png" 
                alt="Wedges" 
                className="h-8 w-8"
              />
              <span className="text-sm font-medium">Wedges</span>
            </button>
            
            <button
              onClick={() => setSelectedClubCategory('irons')}
              className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all ${
                selectedClubCategory === 'irons' 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <img 
                src="/lovable-uploads/c57a3149-6ebc-4ae7-9d9b-68fc874185c5.png" 
                alt="Irons" 
                className="h-8 w-8"
              />
              <span className="text-sm font-medium">Irons</span>
            </button>
            
            <button
              onClick={() => setSelectedClubCategory('woods')}
              className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all ${
                selectedClubCategory === 'woods' 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <img 
                src="/lovable-uploads/15f0eff5-f556-4cb0-81bd-7b4e714d4c75.png" 
                alt="Woods/Hybrids" 
                className="h-8 w-8"
              />
              <span className="text-sm font-medium">Woods/Hybrids</span>
            </button>
            
            <button
              onClick={() => setSelectedClubCategory('driver')}
              className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all ${
                selectedClubCategory === 'driver' 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <img 
                src="/lovable-uploads/827c70c1-d6d2-49aa-8382-bccca369dea4.png" 
                alt="Driver" 
                className="h-8 w-8"
              />
              <span className="text-sm font-medium">Driver</span>
            </button>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Total Swings</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold">{filteredSwingData.length}</div>
              <p className="text-xs text-muted-foreground">
                {selectedClubCategory === 'all' ? 'Analyzed swings' : `${selectedClubCategory} swings`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl font-bold">{latestSwing?.swing_score || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Out of 100</p>
            </CardContent>
          </Card>

          <Card>
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
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    Biggest Strength
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold mb-3 text-green-600">
                    {analysis.strength.metric}: {analysis.strength.value}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.strength.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Biggest Weakness */}
            {analysis.weakness && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                    Biggest Weakness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold mb-3 text-orange-600">
                    {analysis.weakness.metric}: {analysis.weakness.value}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.weakness.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Practice Recommendations */}
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
                <AccordionItem value="drills">
                  <AccordionTrigger>
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

                <AccordionItem value="feels">
                  <AccordionTrigger>
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
                  <AccordionTrigger>
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

        {/* Badge Section */}
        <BadgeSection 
          className="mb-8" 
          onBadgeInteraction={dismissBadgeNotification}
        />

        {/* Swing History - Limited to 5 */}
        <div className="space-y-4">
          <SwingHistoryList swingData={limitedSwingData} onDataUpdate={loadUserData} />
          {filteredSwingData.length > 5 && (
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/swing-history')}
                className="flex items-center gap-2"
              >
                View All Swings ({filteredSwingData.length})
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Badge Notifications */}
      <BadgeNotificationManager 
        newBadges={newBadges}
        onBadgeDismissed={dismissBadgeNotification}
      />

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