import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, TrendingUp, Target, Trophy, History, Upload, Users, User, Settings, Zap, BarChart3, Calendar, Clock, Award, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LeaderboardPreview } from '@/components/LeaderboardPreview';
import { GoalTimeline } from '@/components/GoalTimeline';
import { ModernBadgeSection } from '@/components/ModernBadgeSection';
import Header from '@/components/Header';

interface DashboardStats {
  totalSwings: number;
  avgAccuracy: number;
  improvementRate: number;
  currentStreak: number;
  bestScore: number;
  recentActivity: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
  }>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          console.error('User not authenticated.');
          return;
        }

        const { data, error } = await supabase
          .from('dashboard_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching dashboard stats:', error);
          toast.error('Failed to load dashboard stats.');
          return;
        }

        setStats(data);
      } catch (error) {
        console.error('Error processing dashboard stats:', error);
        toast.error('Unexpected error loading dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardStats();
  }, [user]);

  const quickActions = [
    {
      title: "Analyze Swing",
      description: "Upload a photo or video to analyze your swing",
      icon: Camera,
      action: () => navigate('/analyze'),
      color: "bg-blue-500 hover:bg-blue-600",
      textColor: "text-blue-600"
    },
    {
      title: "View Progress",
      description: "Track your improvement over time",
      icon: TrendingUp,
      action: () => navigate('/profile'),
      color: "bg-green-500 hover:bg-green-600",
      textColor: "text-green-600"
    },
    {
      title: "Swing History",
      description: "Review your past swing analyses",
      icon: History,
      action: () => navigate('/swing-history'),
      color: "bg-purple-500 hover:bg-purple-600",
      textColor: "text-purple-600"
    },
    {
      title: "Leaderboard",
      description: "See how you rank against others",
      icon: Trophy,
      action: () => navigate('/leaderboard'),
      color: "bg-orange-500 hover:bg-orange-600",
      textColor: "text-orange-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.email?.split('@')[0] || 'Golfer'}!
              </h1>
              <p className="text-muted-foreground">Ready to improve your game today?</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-muted/40 hover:border-primary/20 cursor-pointer group" onClick={action.action}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <action.icon className={`h-6 w-6 ${action.textColor}`} />
                  <div className={`h-8 w-8 ${action.color} rounded-full flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="border-muted/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  Total Swings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.totalSwings}</div>
                <p className="text-xs text-muted-foreground">Analyzed swings</p>
              </CardContent>
            </Card>

            <Card className="border-muted/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  Avg Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.avgAccuracy}%</div>
                <p className="text-xs text-muted-foreground">Overall precision</p>
              </CardContent>
            </Card>

            <Card className="border-muted/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">+{stats.improvementRate}%</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card className="border-muted/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.currentStreak}</div>
                <p className="text-xs text-muted-foreground">Days active</p>
              </CardContent>
            </Card>

            <Card className="border-muted/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  Best Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.bestScore}</div>
                <p className="text-xs text-muted-foreground">Personal best</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Goals and Badges */}
          <div className="lg:col-span-2 space-y-8">
            <GoalTimeline />
            <ModernBadgeSection />
          </div>

          {/* Right Column - Leaderboard and Activity */}
          <div className="space-y-8">
            <LeaderboardPreview />
            
            {/* Recent Activity */}
            <Card className="border-muted/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest golf activities</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-muted/40">
                        <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs px-2 py-0">
                              {activity.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                    <p className="text-xs">Start analyzing swings to see your activity here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
