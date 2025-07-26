import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Calendar, TrendingUp, Trophy, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { GoalCreationModal } from './GoalCreationModal';
import { analyzeWorstMetric, createAIGoal, type GoalSuggestion } from '@/utils/goalAssignmentService';
import { format, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Goal {
  id: string;
  goal_type: 'data_point' | 'handicap';
  assignment_type: 'ai_assigned' | 'self_assigned';
  metric_name?: string;
  current_value?: number;
  target_value: number;
  current_handicap?: number;
  target_handicap?: number;
  target_date: string;
  is_completed: boolean;
  progress_percentage: number;
  created_at: string;
}

interface GoalTimelineProps {
  userId: string;
  currentHandicap?: number;
}

export const GoalTimeline: React.FC<GoalTimelineProps> = ({ userId, currentHandicap }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<GoalSuggestion | null>(null);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  
  const { toast } = useToast();

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals((data || []) as Goal[]);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkForAiSuggestion = async () => {
    // Only suggest AI goal if user doesn't have any active goals
    const activeGoals = goals.filter(goal => !goal.is_completed);
    if (activeGoals.length === 0) {
      const suggestion = await analyzeWorstMetric(userId);
      if (suggestion) {
        setAiSuggestion(suggestion);
        setShowAiSuggestion(true);
      }
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  useEffect(() => {
    if (!isLoading && goals.length === 0) {
      checkForAiSuggestion();
    }
  }, [isLoading, goals]);

  const handleAcceptAiSuggestion = async () => {
    if (!aiSuggestion) return;
    
    const goal = await createAIGoal(userId, aiSuggestion);
    if (goal) {
      toast({
        title: "AI Goal Created",
        description: `Goal created to improve your ${aiSuggestion.metric_name}`,
      });
      setShowAiSuggestion(false);
      fetchGoals();
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      
      toast({
        title: "Goal Deleted",
        description: "Goal has been removed successfully.",
      });
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal.",
        variant: "destructive"
      });
    }
  };

  const handleMarkComplete = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString(),
          progress_percentage: 100 
        })
        .eq('id', goalId);

      if (error) throw error;
      
      toast({
        title: "Goal Completed!",
        description: "Congratulations on achieving your goal!",
      });
      fetchGoals();
    } catch (error) {
      console.error('Error completing goal:', error);
    }
  };

  const getDaysRemaining = (targetDate: string) => {
    return differenceInDays(new Date(targetDate), new Date());
  };

  const getProgressColor = (progress: number, daysRemaining: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (daysRemaining < 0) return 'bg-red-500';
    if (daysRemaining < 7) return 'bg-orange-500';
    return 'bg-primary';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goals & Progress
            </CardTitle>
            <Button onClick={() => setShowCreateModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* AI Suggestion Banner */}
          {showAiSuggestion && aiSuggestion && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">AI Goal Suggestion</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Based on your recent swings, we recommend improving your{' '}
                    <span className="font-medium">{aiSuggestion.metric_name}</span> from{' '}
                    {aiSuggestion.current_value} to {aiSuggestion.target_value} by{' '}
                    {format(aiSuggestion.target_date, 'MMM dd, yyyy')}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAcceptAiSuggestion}>
                      Accept Goal
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAiSuggestion(false)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Goals List - Only show if there are goals */}
          {goals.length > 0 && (
            <div className="space-y-3">
              {goals.map((goal) => {
                const daysRemaining = getDaysRemaining(goal.target_date);
                const isOverdue = daysRemaining < 0 && !goal.is_completed;
                
                return (
                  <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">
                            {goal.goal_type === 'data_point' 
                              ? `Improve ${goal.metric_name}`
                              : `Lower Handicap to ${goal.target_handicap}`}
                          </h4>
                          <Badge variant={goal.assignment_type === 'ai_assigned' ? 'default' : 'secondary'} className="text-xs">
                            {goal.assignment_type === 'ai_assigned' ? 'AI' : 'Self'}
                          </Badge>
                          {goal.is_completed && (
                            <Badge variant="default" className="bg-green-500 text-xs">
                              <Trophy className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground mb-2">
                          {goal.goal_type === 'data_point' ? (
                            <>Target: {goal.target_value} | Current: {goal.current_value || 'TBD'}</>
                          ) : (
                            <>From {goal.current_handicap} to {goal.target_handicap}</>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {format(new Date(goal.target_date), 'MMM dd, yyyy')}</span>
                          {!goal.is_completed && (
                            <span className={isOverdue ? 'text-red-500' : ''}>
                              ({isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`})
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">⋮</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!goal.is_completed && (
                            <DropdownMenuItem onClick={() => handleMarkComplete(goal.id)}>
                              <Trophy className="h-4 w-4 mr-2" />
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span>{Math.round(goal.progress_percentage)}%</span>
                      </div>
                      <Progress 
                        value={goal.progress_percentage} 
                        className="h-2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <GoalCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGoalCreated={fetchGoals}
        userId={userId}
        currentHandicap={currentHandicap}
      />
    </>
  );
};