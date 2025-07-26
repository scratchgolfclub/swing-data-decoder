import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar, 
  Target,
  ArrowRight,
  Timer
} from 'lucide-react';

interface ProgressData {
  id: string;
  overall_score: number;
  progress_summary: string;
  strengths: string[];
  improvement_areas: string[];
  notes: string;
  created_at: string;
}

interface SwingData {
  id: string;
  session_name: string;
  club_type: string;
  swing_score: number;
  is_baseline: boolean;
  created_at: string;
}

interface PracticeSessionCardProps {
  progressData: ProgressData[];
  swingData: SwingData[];
  onViewProgress: () => void;
  className?: string;
}

export const PracticeSessionCard = ({ 
  progressData, 
  swingData, 
  onViewProgress, 
  className 
}: PracticeSessionCardProps) => {
  const latestProgress = progressData[0];
  const recentSessions = swingData.slice(0, 3);
  
  // Calculate improvement trend
  const getImprovementTrend = () => {
    if (progressData.length < 2) return null;
    
    const latest = progressData[0];
    const previous = progressData[1];
    const improvement = latest.overall_score - previous.overall_score;
    
    return {
      value: improvement,
      percentage: Math.abs((improvement / previous.overall_score) * 100),
      isPositive: improvement >= 0
    };
  };

  // Get average score from recent swings
  const getAverageScore = () => {
    if (recentSessions.length === 0) return 0;
    const total = recentSessions.reduce((sum, swing) => sum + (swing.swing_score || 0), 0);
    return Math.round(total / recentSessions.length);
  };

  const trend = getImprovementTrend();
  const averageScore = getAverageScore();

  if (!latestProgress && recentSessions.length === 0) {
    return (
      <Card className={`bg-gradient-to-br from-surface to-surface-elevated border-border/60 shadow-card ${className}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <BarChart3 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Practice Progress</CardTitle>
              <CardDescription className="text-sm">Track your improvement over time</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Start your first swing analysis to track your progress!</p>
            <Button variant="outline" className="rounded-xl">
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-surface to-surface-elevated border-border/60 shadow-card ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <BarChart3 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Practice Progress</CardTitle>
              <CardDescription className="text-sm">Your improvement journey</CardDescription>
            </div>
          </div>
          {latestProgress && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewProgress}
              className="flex items-center gap-2 text-primary hover:text-primary-600"
            >
              View Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        {latestProgress && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Overall Score</span>
                  {trend && (
                    <Badge 
                      variant={trend.isPositive ? "default" : "secondary"}
                      className={`flex items-center gap-1 ${
                        trend.isPositive 
                          ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                          : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
                      }`}
                    >
                      {trend.isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on {progressData.length} session{progressData.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  {latestProgress.overall_score || 0}
                </div>
                <div className="text-xs text-muted-foreground">out of 100</div>
              </div>
            </div>
            <Progress 
              value={latestProgress.overall_score || 0} 
              className="h-2"
            />
          </div>
        )}

        {/* Recent Sessions Summary */}
        {recentSessions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">Recent Sessions</h4>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Avg: {averageScore}/100
                </span>
              </div>
            </div>
            
            <div className="grid gap-3">
              {recentSessions.map((session) => (
                <div 
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-foreground">
                      {session.session_name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Target className="h-3 w-3" />
                      {session.club_type}
                      <span>•</span>
                      <Calendar className="h-3 w-3" />
                      {new Date(session.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-foreground">
                      {session.swing_score || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Summary */}
        {latestProgress && latestProgress.progress_summary && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Latest Insights</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {latestProgress.progress_summary}
            </p>
          </div>
        )}

        {/* Key Areas */}
        {latestProgress && (latestProgress.strengths?.length > 0 || latestProgress.improvement_areas?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestProgress.strengths?.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
                  Strengths
                </h5>
                <div className="space-y-1">
                  {latestProgress.strengths.slice(0, 2).map((strength, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      • {strength}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {latestProgress.improvement_areas?.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                  Focus Areas
                </h5>
                <div className="space-y-1">
                  {latestProgress.improvement_areas.slice(0, 2).map((area, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      • {area}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};