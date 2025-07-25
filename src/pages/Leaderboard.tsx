import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaderboardService, LeaderboardData, LeaderboardUser } from '@/utils/leaderboardService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp, Medal, Award, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    longestDrive: [],
    mostAccurate: [],
    mostImprovement: []
  });
  const [loading, setLoading] = useState(true);
  const [userRankings, setUserRankings] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await leaderboardService.getLeaderboardData();
        setLeaderboardData(data);

        if (user) {
          const rankings = await leaderboardService.getUserRankings(user.id);
          setUserRankings(rankings);
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <div className="h-5 w-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</div>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-amber-900";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const LeaderboardCard = ({ 
    users, 
    title, 
    description, 
    icon, 
    metric 
  }: { 
    users: LeaderboardUser[], 
    title: string, 
    description: string, 
    icon: React.ReactNode,
    metric: keyof LeaderboardUser
  }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {users.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No data available yet. Start uploading swings to compete!</p>
          </Card>
        ) : (
          users.map((userEntry) => (
            <Card key={userEntry.user_id} className={cn(
              "transition-all hover:shadow-md",
              userEntry.user_id === user?.id && "ring-2 ring-primary"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRankIcon(userEntry.rank)}
                    <div>
                      <p className="font-medium">{userEntry.first_name} {userEntry.last_name}</p>
                      <p className="text-sm text-muted-foreground">{userEntry.total_swings} swings</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getRankBadgeColor(userEntry.rank)}>
                      {metric === 'longest_drive' && `${userEntry.longest_drive} yds`}
                      {metric === 'accuracy_average' && `${userEntry.accuracy_average.toFixed(1)} ft avg`}
                      {metric === 'improvement_score' && `${userEntry.improvement_score.toFixed(1)}% improved`}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold gradient-text-premium">Leaderboards</h1>
          <p className="text-muted-foreground">Compete with other members and track your progress</p>
        </div>
      </div>

      {userRankings && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Rankings</CardTitle>
            <CardDescription>See how you stack up against other members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Longest Drive</p>
                <p className="text-lg font-semibold">#{userRankings.rankings.longestDrive}</p>
                <p className="text-sm">{userRankings.stats.longest_drive} yards</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Most Accurate</p>
                <p className="text-lg font-semibold">#{userRankings.rankings.mostAccurate}</p>
                <p className="text-sm">{userRankings.stats.accuracy_average.toFixed(1)} ft avg</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Most Improvement</p>
                <p className="text-lg font-semibold">#{userRankings.rankings.mostImprovement}</p>
                <p className="text-sm">{userRankings.stats.improvement_score.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="longest-drive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="longest-drive">Longest Drive</TabsTrigger>
          <TabsTrigger value="most-accurate">Most Accurate</TabsTrigger>
          <TabsTrigger value="most-improvement">Most Improvement</TabsTrigger>
        </TabsList>

        <TabsContent value="longest-drive">
          <LeaderboardCard
            users={leaderboardData.longestDrive}
            title="Longest Drive"
            description="Members with the furthest driver distances"
            icon={<Trophy className="h-6 w-6 text-primary" />}
            metric="longest_drive"
          />
        </TabsContent>

        <TabsContent value="most-accurate">
          <LeaderboardCard
            users={leaderboardData.mostAccurate}
            title="Most Accurate"
            description="Members with the best accuracy (lowest side deviation)"
            icon={<Target className="h-6 w-6 text-primary" />}
            metric="accuracy_average"
          />
        </TabsContent>

        <TabsContent value="most-improvement">
          <LeaderboardCard
            users={leaderboardData.mostImprovement}
            title="Most Improvement"
            description="Members who have improved their game the most"
            icon={<TrendingUp className="h-6 w-6 text-primary" />}
            metric="improvement_score"
          />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default Leaderboard;