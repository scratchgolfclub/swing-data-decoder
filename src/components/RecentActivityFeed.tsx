import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Clock,
  ArrowRight,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SwingData {
  id: string;
  session_name: string;
  club_type: string;
  swing_score: number;
  is_baseline: boolean;
  created_at: string;
}

interface RecentActivityFeedProps {
  swingData: SwingData[];
  className?: string;
}

export const RecentActivityFeed = ({ swingData, className }: RecentActivityFeedProps) => {
  const navigate = useNavigate();

  console.log('RecentActivityFeed rendering with:', swingData.length, 'swings');
  
  // Get recent sessions (last 5)
  const recentSessions = swingData.slice(0, 5);
  
  // Calculate trend from last two sessions
  const getTrend = () => {
    if (recentSessions.length < 2) return null;
    
    const latest = recentSessions[0].swing_score;
    const previous = recentSessions[1].swing_score;
    const diff = latest - previous;
    
    return {
      value: Math.abs(diff),
      isImproving: diff > 0,
      percentage: previous > 0 ? Math.abs((diff / previous) * 100) : 0
    };
  };

  const trend = getTrend();

  if (recentSessions.length === 0) {
    return (
      <Card className={`bg-gradient-to-br from-surface to-surface-elevated border-border/60 ${className}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
              <CardDescription className="text-sm">Your latest practice sessions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No recent sessions to display</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/analyze')}
              className="rounded-xl"
            >
              Start Analyzing Swings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-surface to-surface-elevated border-border/60 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
              <CardDescription className="text-sm">Your latest practice sessions</CardDescription>
            </div>
          </div>
          
          {trend && (
            <Badge 
              variant={trend.isImproving ? "default" : "secondary"}
              className={`flex items-center gap-1 ${
                trend.isImproving 
                  ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                  : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
              }`}
            >
              {trend.isImproving ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.isImproving ? '+' : '-'}{trend.value.toFixed(0)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{recentSessions.length}</p>
            <p className="text-xs text-muted-foreground">Recent Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {Math.round(recentSessions.reduce((sum, s) => sum + s.swing_score, 0) / recentSessions.length)}
            </p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {new Set(recentSessions.map(s => s.club_type)).size}
            </p>
            <p className="text-xs text-muted-foreground">Club Types</p>
          </div>
        </div>

        {/* Session List */}
        <div className="space-y-2">
          {recentSessions.map((session, index) => (
            <div 
              key={session.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/40 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                  <Target className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{session.session_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(session.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{session.club_type}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {session.swing_score}/100
                </Badge>
                {index === 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Latest
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {swingData.length > 5 && (
          <div className="flex justify-center pt-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/swing-history')}
              className="flex items-center gap-2 text-primary hover:text-primary-600"
            >
              View All Sessions ({swingData.length})
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};