import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target,
  BarChart3,
  Clock,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

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

interface ProgressHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  progressData: ProgressData[];
  swingData: SwingData[];
  onViewSwing?: (swingId: string) => void;
}

export const ProgressHistoryModal = ({
  isOpen,
  onClose,
  progressData,
  swingData,
  onViewSwing
}: ProgressHistoryModalProps) => {
  
  // Calculate session stats
  const getSessionStats = () => {
    const totalSessions = swingData.length;
    const avgScore = totalSessions > 0 
      ? Math.round(swingData.reduce((sum, swing) => sum + swing.swing_score, 0) / totalSessions)
      : 0;
    
    const bestSession = swingData.length > 0 
      ? swingData.reduce((best, swing) => 
          swing.swing_score > best.swing_score ? swing : best
        )
      : null;
    
    return { totalSessions, avgScore, bestSession };
  };

  // Calculate progress trend over time
  const getProgressTrend = () => {
    if (progressData.length < 2) return null;
    
    const latest = progressData[0];
    const oldest = progressData[progressData.length - 1];
    const improvement = latest.overall_score - oldest.overall_score;
    const timespan = Math.ceil(
      (new Date(latest.created_at).getTime() - new Date(oldest.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return {
      improvement,
      timespan,
      isPositive: improvement >= 0,
      rate: timespan > 0 ? improvement / timespan : 0
    };
  };

  // Group swings by date for timeline view
  const getSessionsByDate = () => {
    const grouped = swingData.reduce((acc, swing) => {
      const date = format(new Date(swing.created_at), 'MMM dd, yyyy');
      if (!acc[date]) acc[date] = [];
      acc[date].push(swing);
      return acc;
    }, {} as Record<string, SwingData[]>);

    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 10); // Show last 10 days
  };

  const stats = getSessionStats();
  const trend = getProgressTrend();
  const sessionsByDate = getSessionsByDate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Progress History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-primary">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <p className="text-xs text-muted-foreground mt-1">Practice sessions completed</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgScore}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all sessions</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Best Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.bestSession?.swing_score || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.bestSession?.session_name || 'N/A'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Trend */}
          {trend && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Progress Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
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
                        {trend.isPositive ? '+' : ''}{trend.improvement.toFixed(1)} points
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Over {trend.timespan} days ({Math.abs(trend.rate).toFixed(1)} points/day)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {trend.isPositive ? 'Improving' : 'Needs Focus'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessionsByDate.map(([date, sessions]) => (
                  <div key={date} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium text-sm">{date}</h4>
                      <Badge variant="outline" className="text-xs">
                        {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="ml-6 space-y-2">
                      {sessions.map((session) => (
                        <div 
                          key={session.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{session.session_name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {session.club_type}
                                </Badge>
                                {session.is_baseline && (
                                  <Badge variant="default" className="text-xs bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                    Baseline
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold text-lg">{session.swing_score}</p>
                              <p className="text-xs text-muted-foreground">Score</p>
                            </div>
                            {onViewSwing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewSwing(session.id)}
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress Notes Timeline */}
          {progressData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Progress Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.slice(0, 5).map((progress) => (
                    <div key={progress.id} className="border-l-2 border-primary/30 pl-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">Score: {progress.overall_score}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(progress.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      {progress.progress_summary && (
                        <p className="text-sm text-muted-foreground">{progress.progress_summary}</p>
                      )}
                      {progress.strengths.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {progress.strengths.slice(0, 3).map((strength, index) => (
                            <Badge key={index} variant="default" className="text-xs bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};