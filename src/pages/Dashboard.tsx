import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Upload, TrendingUp, Target, Calendar, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProgressModal from '@/components/ProgressModal';
import SwingHistoryList from '@/components/SwingHistoryList';

interface SwingData {
  id: string;
  session_name: string;
  club_type: string;
  initial_metrics: any;
  post_practice_metrics: any;
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

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [swingData, setSwingData] = useState<SwingData[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
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
      
      // Load swing data - using any to bypass type issues since tables were created manually
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

      // Load progress data - using any to bypass type issues since tables were created manually
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

  const latestSwing = swingData[0];
  const baselineSwing = swingData.find(swing => swing.is_baseline);
  const latestProgress = progressData[0];

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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Track your golf swing improvement over time.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Session</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestSwing ? new Date(latestSwing.created_at).toLocaleDateString() : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {latestSwing?.session_name || 'No sessions yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progress Tracker */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracker</CardTitle>
              <CardDescription>
                Compare your latest swing against your baseline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestSwing && baselineSwing ? (
                <>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Last analyzed swing:</p>
                    <p className="font-medium">{latestSwing.session_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(latestSwing.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowProgressModal(true)}
                    className="w-full"
                    variant="secondary"
                  >
                    View Progress Report
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {swingData.length === 0 
                      ? "Upload your first swing to start tracking progress"
                      : "Need at least 2 swings to compare progress"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>New Swing Analysis</CardTitle>
              <CardDescription>
                Upload TrackMan data for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleNewAnalysis}
                className="w-full h-24 text-lg"
                size="lg"
              >
                <Upload className="h-6 w-6 mr-3" />
                Upload New Swing Data
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

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