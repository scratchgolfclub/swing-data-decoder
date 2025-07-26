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
  Trophy,
  BarChart3,
  Timer,
  Activity,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProgressModal from '@/components/ProgressModal';
import SwingHistoryList from '@/components/SwingHistoryList';
import { ModernBadgeSection } from '@/components/ModernBadgeSection';
import { BadgeNotificationManager } from '@/components/BadgeNotification';
import { useBadges } from '@/hooks/useBadges';
import { GoalTimeline } from '@/components/GoalTimeline';
import { fetchSwingData } from '@/utils/swingDataService';
import Header from '@/components/Header';
import { getStructuredMetrics, getMetricValue, StructuredMetric } from '@/utils/structuredMetricsHelper';
import { MetricCard } from '@/components/MetricCard';
import { InsightCard } from '@/components/InsightCard';
import { PracticeSessionCard } from '@/components/PracticeSessionCard';

interface SwingData {
  id: string;
  session_name: string;
  club_type: string;
  created_at: string;
  trackman_image_url: string;
  // Individual metric columns
  club_speed?: number;
  ball_speed?: number;
  carry?: number;
  total?: number;
  side?: string;
  face_angle?: number;
  club_path?: number;
  smash_factor?: number;
  spin_rate?: number;
  launch_angle?: number;
  insights?: InsightData[];
}

interface InsightData {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  insight_type: string;
  confidence_score: number;
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
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [videoViews, setVideoViews] = useState<VideoView[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHandicap, setCurrentHandicap] = useState<number>();
  const [userFirstName, setUserFirstName] = useState<string>('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedClubCategory, setSelectedClubCategory] = useState<string>('all');
  
  // Badge system integration
  const { 
    badgeProgress, 
    newBadges, 
    checkForNewBadges, 
    dismissBadgeNotification 
  } = useBadges();

  const fetchUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('current_handicap, first_name')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      setCurrentHandicap(data?.current_handicap);
      setUserFirstName(data?.first_name || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
      fetchUserProfile();
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
      
      // Load swing data with insights using the new service
      const swings = await fetchSwingData(user.id);
      setSwingData(swings || []);

      // Extract all insights from swings
      const allInsights = swings
        .flatMap(swing => swing.insights || [])
        .slice(0, 10); // Show latest 10 insights
      
      setInsights(allInsights);

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
    
    // For now, create a simple metrics structure from swing data
    const metrics = [
      { title: 'Club Speed', value: latestSwing.club_speed, descriptor: 'mph' },
      { title: 'Ball Speed', value: latestSwing.ball_speed, descriptor: 'mph' },
      { title: 'Total Distance', value: latestSwing.total, descriptor: 'yds' },
      { title: 'Face Angle', value: latestSwing.face_angle, descriptor: '°' },
    ].filter(m => m.value !== undefined && m.value !== null);
    
    return getStructuredMetrics(metrics);
  };

  const analyzeStrengthAndWeakness = (structuredMetrics: StructuredMetric[]) => {
    if (!structuredMetrics || structuredMetrics.length === 0) {
      return { strength: null, weakness: null };
    }
    // Define club-specific ideal ranges
    const getIdealRanges = () => {
      const baseRanges = {
        'Club Speed': { min: 85, max: 105, unit: ' mph', label: 'Club Speed' },
        'Ball Speed': { min: 120, max: 150, unit: ' mph', label: 'Ball Speed' },
        'Smash Factor': { min: 1.40, max: 1.50, unit: '', label: 'Smash Factor' },
        'Launch Angle': { min: 12, max: 18, unit: '°', label: 'Launch Angle' },
        'Face Angle': { min: -2, max: 2, unit: '°', label: 'Face Angle' },
        'Club Path': { min: -2, max: 2, unit: '°', label: 'Club Path' },
        'Face to Path': { min: -2, max: 2, unit: '°', label: 'Face to Path' },
        'Spin Rate': { min: 5000, max: 7000, unit: ' rpm', label: 'Spin Rate' }
      };

      // Adjust ranges based on club category
      switch (selectedClubCategory) {
        case 'driver':
          return {
            ...baseRanges,
            'Club Speed': { min: 95, max: 115, unit: ' mph', label: 'Club Speed' },
            'Ball Speed': { min: 140, max: 170, unit: ' mph', label: 'Ball Speed' },
            'Launch Angle': { min: 10, max: 15, unit: '°', label: 'Launch Angle' },
            'Spin Rate': { min: 2000, max: 3000, unit: ' rpm', label: 'Spin Rate' }
          };
        case 'woods':
          return {
            ...baseRanges,
            'Club Speed': { min: 85, max: 105, unit: ' mph', label: 'Club Speed' },
            'Ball Speed': { min: 130, max: 160, unit: ' mph', label: 'Ball Speed' },
            'Launch Angle': { min: 12, max: 18, unit: '°', label: 'Launch Angle' },
            'Spin Rate': { min: 3000, max: 4500, unit: ' rpm', label: 'Spin Rate' }
          };
        case 'irons':
          return {
            ...baseRanges,
            'Club Speed': { min: 75, max: 95, unit: ' mph', label: 'Club Speed' },
            'Ball Speed': { min: 110, max: 140, unit: ' mph', label: 'Ball Speed' },
            'Launch Angle': { min: 15, max: 25, unit: '°', label: 'Launch Angle' },
            'Spin Rate': { min: 6000, max: 8000, unit: ' rpm', label: 'Spin Rate' }
          };
        case 'wedges':
          return {
            ...baseRanges,
            'Club Speed': { min: 65, max: 85, unit: ' mph', label: 'Club Speed' },
            'Ball Speed': { min: 90, max: 120, unit: ' mph', label: 'Ball Speed' },
            'Launch Angle': { min: 20, max: 35, unit: '°', label: 'Launch Angle' },
            'Spin Rate': { min: 8000, max: 12000, unit: ' rpm', label: 'Spin Rate' }
          };
        default:
          return baseRanges;
      }
    };

    const idealRanges = getIdealRanges();

    const scores = Object.entries(idealRanges).map(([key, range]) => {
      const value = getMetricValue(structuredMetrics, key);
      if (value === null || isNaN(value)) return null;
      
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

    // Create a properly structured swing object for the recommendation engine
    const combinedSwing = {
      ...latestSwing,
      structuredMetrics: metrics  // Use the correct property name expected by the engine
    };

    // Use insights from the latest swing instead of frontend recommendation engine
    const swingInsights = latestSwing.insights || [];
    const videoRecs = swingInsights
      .filter(insight => insight.video_url)
      .slice(0, 3)
      .map(insight => ({
        title: insight.title,
        reason: insight.description,
        url: insight.video_url
      }));

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
      
      <div className="container-premium py-12 space-y-12">
        {/* Hero Section */}
        <div className="flex items-center justify-between mb-16">
          <div className="space-y-4">
            <h1 className="text-5xl font-light text-foreground tracking-tight">
              Welcome back{userFirstName ? `, ${userFirstName}` : ''}!
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Track your golf swing improvement and discover insights to take your game to the next level.
            </p>
          </div>
          <Button 
            onClick={handleNewAnalysis}
            className="btn-premium h-14 px-8 text-base font-medium rounded-2xl"
            size="lg"
          >
            <Upload className="h-5 w-5 mr-3" />
            New Analysis
          </Button>
        </div>

        {/* Club Category Selection */}
        <div className="mb-16">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { key: 'all', label: 'All Clubs', icon: '/lovable-uploads/8a0a0e9f-0b6f-4cf8-821e-369fa9e4f703.png' },
              { key: 'wedges', label: 'Wedges', icon: '/lovable-uploads/97faaec3-4379-4d26-bbf2-27f2530baac8.png' },
              { key: 'irons', label: 'Irons', icon: '/lovable-uploads/c57a3149-6ebc-4ae7-9d9b-68fc874185c5.png' },
              { key: 'woods', label: 'Woods', icon: '/lovable-uploads/15f0eff5-f556-4cb0-81bd-7b4e714d4c75.png' },
              { key: 'driver', label: 'Driver', icon: '/lovable-uploads/827c70c1-d6d2-49aa-8382-bccca369dea4.png' }
            ].map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedClubCategory(category.key)}
                className={`group relative flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  selectedClubCategory === category.key 
                    ? 'bg-gradient-to-br from-primary to-primary-600 text-primary-foreground shadow-button' 
                    : 'bg-card border border-border/60 hover:border-primary/40 hover:shadow-card'
                }`}
              >
                <div className={`p-3 rounded-xl transition-colors ${
                  selectedClubCategory === category.key
                    ? 'bg-white/20'
                    : 'bg-surface group-hover:bg-primary-50'
                }`}>
                  <img 
                    src={category.icon} 
                    alt={category.label} 
                    className="h-8 w-8"
                  />
                </div>
                <span className="text-sm font-medium">{category.label}</span>
                
                {selectedClubCategory === category.key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent rounded-2xl" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <MetricCard
            title="Total Swings"
            value={filteredSwingData.length}
            change={`${selectedClubCategory} category`}
            icon={Target}
            variant="gradient"
          />
          <MetricCard
            title="Total Distance"
            value={latestSwing?.total ? `${latestSwing.total} yds` : 'No data'}
            change="Last session"
            icon={BarChart3}
            variant="accent"
          />
          <MetricCard
            title="Practice Sessions"
            value={new Set(filteredSwingData.map(s => s.session_name)).size}
            change="Unique sessions"
            icon={Timer}
            variant="default"
          />
        </div>

        {/* Insight Cards - Strength & Weakness Analysis */}
        {latestSwing && analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {analysis.strength && (
              <InsightCard
                type="strength"
                title={analysis.strength.metric}
                value={analysis.strength.value}
                description={analysis.strength.description}
                icon={Trophy}
              />
            )}

            {analysis.weakness && (
              <InsightCard
                type="weakness"
                title={analysis.weakness.metric}
                value={analysis.weakness.value}
                description={analysis.weakness.description}
                icon={AlertTriangle}
              />
            )}
          </div>
        )}

        {/* Practice Prescription */}
        {latestSwing && (
          <Card className="mb-16 bg-gradient-to-br from-surface-elevated to-surface border-border/60 shadow-elegant">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                  <Stethoscope className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-semibold">Your Practice Prescription</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Personalized recommendations based on your latest swing analysis
                  </CardDescription>
                </div>
              </div>
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

        {/* Goal Timeline */}
        <GoalTimeline userId={user.id} currentHandicap={currentHandicap} />

        {/* Practice Progress Section - Temporarily disabled until we update PracticeSessionCard */}
        {/* <PracticeSessionCard 
          progressData={progressData}
          swingData={filteredSwingData}
          onViewProgress={() => setShowProgressModal(true)}
          className="mb-16"
        /> */}

        {/* Achievements Section */}
        <ModernBadgeSection 
          className="mb-16" 
          onBadgeInteraction={dismissBadgeNotification}
        />

        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-surface to-surface-elevated border-border/60 shadow-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
                <CardDescription className="text-sm">Your latest swing sessions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SwingHistoryList swingData={limitedSwingData} onDataUpdate={loadUserData} />
            {filteredSwingData.length > 5 && (
              <div className="flex justify-center pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/swing-history')}
                  className="flex items-center gap-2 rounded-xl"
                >
                  View All Swings ({filteredSwingData.length})
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Badge Notifications */}
      <BadgeNotificationManager 
        newBadges={newBadges}
        onBadgeDismissed={dismissBadgeNotification}
      />

      {/* Progress Modal - Temporarily disabled until we update ProgressModal */}
      {/* {showProgressModal && latestSwing && baselineSwing && (
        <ProgressModal
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          latestSwing={latestSwing}
          baselineSwing={baselineSwing}
          progressData={latestProgress}
        />
      )} */}
    </div>
  );
};

export default Dashboard;