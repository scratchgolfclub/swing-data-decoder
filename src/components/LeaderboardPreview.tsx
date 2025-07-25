import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { leaderboardService } from '@/utils/leaderboardService';
import { Link } from 'react-router-dom';

const LeaderboardPreview = () => {
  const { user } = useAuth();
  const [userRankings, setUserRankings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRankings = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const rankings = await leaderboardService.getUserRankings(user.id);
        setUserRankings(rankings);
      } catch (error) {
        console.error('Error fetching user rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRankings();
  }, [user?.id]);

  if (loading || !userRankings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Rankings
          </CardTitle>
          <CardDescription>See how you compare to other members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Your Rankings
        </CardTitle>
        <CardDescription>See how you compare to other members</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Trophy className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
            <p className="text-xs text-muted-foreground">Drive</p>
            <p className="text-sm font-semibold">#{userRankings.rankings.longestDrive}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Target className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <p className="text-xs text-muted-foreground">Accuracy</p>
            <p className="text-sm font-semibold">#{userRankings.rankings.mostAccurate}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
            <p className="text-xs text-muted-foreground">Improvement</p>
            <p className="text-sm font-semibold">#{userRankings.rankings.mostImprovement}</p>
          </div>
        </div>
        
        <Button asChild variant="outline" className="w-full">
          <Link to="/leaderboard" className="flex items-center gap-2">
            View Full Leaderboards
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default LeaderboardPreview;