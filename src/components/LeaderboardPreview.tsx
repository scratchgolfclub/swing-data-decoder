import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { getUserLeaderboardStats, LeaderboardStats } from '@/utils/leaderboardService';
import { useNavigate } from 'react-router-dom';

const LeaderboardPreview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const userStats = await getUserLeaderboardStats(user.id);
        setStats(userStats);
      } catch (error) {
        console.error('Error fetching leaderboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  const formatRank = (rank: number | null, total: number) => {
    if (rank === null) return 'Unranked';
    return `#${rank} of ${total}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Your Rankings
        </CardTitle>
        <CardDescription>See how you compare to other players</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">Longest Drive</span>
            </div>
            <Badge variant="secondary">
              {formatRank(stats.longest_drive_rank, stats.total_users)}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <span className="font-medium">Accuracy</span>
            </div>
            <Badge variant="secondary">
              {formatRank(stats.accuracy_rank, stats.total_users)}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Improvement</span>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
        </div>

        <Button 
          onClick={() => navigate('/leaderboard')} 
          className="w-full"
          variant="outline"
        >
          View Full Leaderboards
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default LeaderboardPreview;