import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp, Medal, Users } from 'lucide-react';
import { getLeaderboard, LeaderboardEntry } from '@/utils/leaderboardService';

const Leaderboard = () => {
  const { user } = useAuth();
  const [longestDriveData, setLongestDriveData] = useState<LeaderboardEntry[]>([]);
  const [accuracyData, setAccuracyData] = useState<LeaderboardEntry[]>([]);
  const [improvementData, setImprovementData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);
      try {
        const [longest, accuracy, improvement] = await Promise.all([
          getLeaderboard('longest_drive', 50),
          getLeaderboard('accuracy', 50),
          getLeaderboard('improvement', 50)
        ]);

        setLongestDriveData(longest);
        setAccuracyData(accuracy);
        setImprovementData(improvement);
      } catch (error) {
        console.error('Error fetching leaderboards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-medium">#{rank}</span>;
    }
  };

  const LeaderboardList = ({ 
    data, 
    valueKey, 
    valueLabel, 
    valueFormatter 
  }: {
    data: LeaderboardEntry[];
    valueKey: keyof LeaderboardEntry;
    valueLabel: string;
    valueFormatter: (value: any) => string;
  }) => (
    <div className="space-y-2">
      {data.map((entry, index) => {
        const isCurrentUser = entry.user_id === user?.id;
        const value = entry[valueKey];
        
        return (
          <Card 
            key={entry.user_id} 
            className={`transition-all ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <p className={`font-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                      {entry.first_name} {entry.last_name}
                      {isCurrentUser && <Badge className="ml-2" variant="secondary">You</Badge>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {entry.total_swings} swing{entry.total_swings !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {value !== null ? valueFormatter(value) : 'No data'}
                  </p>
                  <p className="text-xs text-muted-foreground">{valueLabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading leaderboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text-premium mb-2">Leaderboards</h1>
        <p className="text-muted-foreground">See how you rank against other players</p>
      </div>

      <Tabs defaultValue="longest-drive" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="longest-drive" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Longest Drive
          </TabsTrigger>
          <TabsTrigger value="accuracy" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Most Accurate
          </TabsTrigger>
          <TabsTrigger value="improvement" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Most Improvement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="longest-drive" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Longest Drive Leaderboard
              </CardTitle>
              <CardDescription>
                Rankings based on the longest recorded drive distance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardList
                data={longestDriveData}
                valueKey="longest_drive"
                valueLabel="yards"
                valueFormatter={(value) => `${Math.round(value)} yds`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accuracy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Most Accurate Leaderboard
              </CardTitle>
              <CardDescription>
                Rankings based on average accuracy (lower is better)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardList
                data={accuracyData}
                valueKey="accuracy_average"
                valueLabel="avg yards offline"
                valueFormatter={(value) => `${Math.abs(Math.round(value))} yds`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvement" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Most Improvement Leaderboard
              </CardTitle>
              <CardDescription>
                Rankings based on overall improvement over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Improvement tracking coming soon!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboard;