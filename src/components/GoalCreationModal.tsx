import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GoalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: () => void;
  userId: string;
  currentHandicap?: number;
}

const TRACKMAN_METRICS = [
  { value: 'Total Distance', label: 'Total Distance (yards)' },
  { value: 'Carry Distance', label: 'Carry Distance (yards)' },
  { value: 'Side', label: 'Side Deviation (yards)' },
  { value: 'Club Head Speed', label: 'Club Head Speed (mph)' },
  { value: 'Ball Speed', label: 'Ball Speed (mph)' },
  { value: 'Smash Factor', label: 'Smash Factor' },
  { value: 'Launch Angle', label: 'Launch Angle (°)' },
  { value: 'Spin Rate', label: 'Spin Rate (rpm)' }
];

export const GoalCreationModal: React.FC<GoalCreationModalProps> = ({
  isOpen,
  onClose,
  onGoalCreated,
  userId,
  currentHandicap
}) => {
  const [step, setStep] = useState(1);
  const [goalType, setGoalType] = useState<'data_point' | 'handicap'>('data_point');
  const [selectedMetric, setSelectedMetric] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [targetDate, setTargetDate] = useState<Date>();
  const [handicapValue, setHandicapValue] = useState(currentHandicap?.toString() || '');
  const [targetHandicap, setTargetHandicap] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const resetForm = () => {
    setStep(1);
    setGoalType('data_point');
    setSelectedMetric('');
    setTargetValue('');
    setTargetDate(undefined);
    setHandicapValue(currentHandicap?.toString() || '');
    setTargetHandicap('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (step === 1 && goalType === 'handicap' && !currentHandicap && !handicapValue) {
      toast({
        title: "Handicap Required",
        description: "Please enter your current handicap to set a handicap goal.",
        variant: "destructive"
      });
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const updateHandicap = async (handicap: number) => {
    try {
      // Update profile with current handicap
      await supabase
        .from('profiles')
        .update({ current_handicap: handicap })
        .eq('user_id', userId);

      // Add to handicap history
      await supabase
        .from('handicap_history')
        .insert({
          user_id: userId,
          handicap_value: handicap
        });
    } catch (error) {
      console.error('Error updating handicap:', error);
    }
  };

  const handleSubmit = async () => {
    if (!targetDate) {
      toast({
        title: "Date Required",
        description: "Please select a target completion date.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const goalData: any = {
        user_id: userId,
        goal_type: goalType,
        assignment_type: 'self_assigned',
        target_date: format(targetDate, 'yyyy-MM-dd'),
        progress_percentage: 0
      };

      if (goalType === 'data_point') {
        goalData.metric_name = selectedMetric;
        goalData.target_value = parseFloat(targetValue);
      } else {
        // Update handicap if provided
        if (handicapValue && !currentHandicap) {
          await updateHandicap(parseFloat(handicapValue));
        }
        
        goalData.current_handicap = parseFloat(handicapValue);
        goalData.target_handicap = parseFloat(targetHandicap);
      }

      const { error } = await supabase
        .from('user_goals')
        .insert(goalData);

      if (error) throw error;

      toast({
        title: "Goal Created",
        description: "Your goal has been successfully created!",
      });

      handleClose();
      onGoalCreated();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedStep1 = goalType === 'data_point' || (goalType === 'handicap' && (currentHandicap || handicapValue));
  const canProceedStep2 = goalType === 'data_point' ? (selectedMetric && targetValue) : (handicapValue && targetHandicap);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Goal Type */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Goal Type</Label>
                <Select value={goalType} onValueChange={(value: 'data_point' | 'handicap') => setGoalType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data_point">TrackMan Data Point</SelectItem>
                    <SelectItem value="handicap">Handicap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {goalType === 'handicap' && !currentHandicap && (
                <div>
                  <Label htmlFor="current-handicap">Current Handicap</Label>
                  <Input
                    id="current-handicap"
                    type="number"
                    step="0.1"
                    value={handicapValue}
                    onChange={(e) => setHandicapValue(e.target.value)}
                    placeholder="Enter your current handicap"
                  />
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleNext} disabled={!canProceedStep1}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Target Selection */}
          {step === 2 && (
            <div className="space-y-4">
              {goalType === 'data_point' ? (
                <>
                  <div>
                    <Label>Select Metric</Label>
                    <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a TrackMan metric" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRACKMAN_METRICS.map((metric) => (
                          <SelectItem key={metric.value} value={metric.value}>
                            {metric.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="target-value">Target Value</Label>
                    <Input
                      id="target-value"
                      type="number"
                      step="0.1"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      placeholder="Enter target value"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Current Handicap: {currentHandicap || handicapValue}</Label>
                  </div>
                  
                  <div>
                    <Label htmlFor="target-handicap">Target Handicap</Label>
                    <Input
                      id="target-handicap"
                      type="number"
                      step="0.1"
                      value={targetHandicap}
                      onChange={(e) => setTargetHandicap(e.target.value)}
                      placeholder="Enter target handicap"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext} disabled={!canProceedStep2}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Target Date */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Target Completion Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !targetDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {targetDate ? format(targetDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={targetDate}
                      onSelect={setTargetDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleSubmit} disabled={!targetDate || isLoading}>
                  {isLoading ? 'Creating...' : 'Create Goal'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};