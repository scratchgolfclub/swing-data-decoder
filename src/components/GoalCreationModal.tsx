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

const CLUB_CATEGORIES = [
  { value: 'driver', label: 'Driver', icon: '🏌️', description: 'Long distance shots off the tee' },
  { value: 'woods', label: 'Woods/Hybrids', icon: '🌳', description: 'Fairway woods and hybrid clubs' },
  { value: 'irons', label: 'Irons', icon: '⚡', description: 'Approach shots and mid-range accuracy' },
  { value: 'wedges', label: 'Wedges', icon: '🎯', description: 'Short game and precision shots' }
];

const TRACKMAN_METRICS = [
  { value: 'Total Distance', label: 'Total Distance (yards)', icon: '📏' },
  { value: 'Carry Distance', label: 'Carry Distance (yards)', icon: '🚀' },
  { value: 'Side', label: 'Side Deviation (yards)', icon: '↔️' },
  { value: 'Club Head Speed', label: 'Club Head Speed (mph)', icon: '💨' },
  { value: 'Ball Speed', label: 'Ball Speed (mph)', icon: '⚡' },
  { value: 'Smash Factor', label: 'Smash Factor', icon: '💥' },
  { value: 'Launch Angle', label: 'Launch Angle (°)', icon: '📐' },
  { value: 'Spin Rate', label: 'Spin Rate (rpm)', icon: '🌪️' }
];

const getTargetRanges = (metric: string, clubCategory: string) => {
  const ranges = {
    driver: {
      'Total Distance': { min: 250, max: 300, good: 275 },
      'Carry Distance': { min: 230, max: 280, good: 255 },
      'Club Head Speed': { min: 95, max: 115, good: 105 },
      'Ball Speed': { min: 140, max: 170, good: 155 },
      'Smash Factor': { min: 1.40, max: 1.50, good: 1.45 },
      'Launch Angle': { min: 10, max: 15, good: 12.5 },
      'Spin Rate': { min: 2000, max: 3000, good: 2500 }
    },
    woods: {
      'Total Distance': { min: 200, max: 250, good: 225 },
      'Carry Distance': { min: 180, max: 230, good: 205 },
      'Club Head Speed': { min: 85, max: 105, good: 95 },
      'Ball Speed': { min: 130, max: 160, good: 145 },
      'Smash Factor': { min: 1.35, max: 1.45, good: 1.40 },
      'Launch Angle': { min: 12, max: 18, good: 15 },
      'Spin Rate': { min: 3000, max: 4500, good: 3750 }
    },
    irons: {
      'Total Distance': { min: 140, max: 180, good: 160 },
      'Carry Distance': { min: 130, max: 170, good: 150 },
      'Club Head Speed': { min: 75, max: 95, good: 85 },
      'Ball Speed': { min: 110, max: 140, good: 125 },
      'Smash Factor': { min: 1.30, max: 1.40, good: 1.35 },
      'Launch Angle': { min: 15, max: 25, good: 20 },
      'Spin Rate': { min: 6000, max: 8000, good: 7000 }
    },
    wedges: {
      'Total Distance': { min: 80, max: 120, good: 100 },
      'Carry Distance': { min: 75, max: 115, good: 95 },
      'Club Head Speed': { min: 65, max: 85, good: 75 },
      'Ball Speed': { min: 90, max: 120, good: 105 },
      'Smash Factor': { min: 1.20, max: 1.35, good: 1.27 },
      'Launch Angle': { min: 20, max: 35, good: 27.5 },
      'Spin Rate': { min: 8000, max: 12000, good: 10000 }
    }
  };
  
  return ranges[clubCategory]?.[metric] || { min: 0, max: 100, good: 50 };
};

export const GoalCreationModal: React.FC<GoalCreationModalProps> = ({
  isOpen,
  onClose,
  onGoalCreated,
  userId,
  currentHandicap
}) => {
  const [step, setStep] = useState(1);
  const [goalType, setGoalType] = useState<'data_point' | 'handicap'>('data_point');
  const [clubCategory, setClubCategory] = useState('driver');
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
    setClubCategory('driver');
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
  const canProceedStep2 = goalType === 'data_point' ? clubCategory : true;
  const canProceedStep3 = goalType === 'data_point' ? (selectedMetric && targetValue) : (handicapValue && targetHandicap);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl">🎯 Create Your Goal</DialogTitle>
          <p className="text-muted-foreground">Set a specific target and track your improvement journey</p>
        </DialogHeader>

        <div className="space-y-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {[1, 2, 3, goalType === 'data_point' ? 4 : 3].map((stepNum, index) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {stepNum}
                </div>
                {index < (goalType === 'data_point' ? 3 : 2) && (
                  <div className={`w-8 h-0.5 ${step > stepNum ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Goal Type */}
          {step === 1 && (
            <div className="space-y-6 text-center">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">🎯 Choose Your Goal Type</h3>
                <p className="text-muted-foreground">What kind of improvement are you targeting?</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    goalType === 'data_point' ? 'border-primary bg-primary/10' : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => setGoalType('data_point')}
                >
                  <div className="text-3xl mb-3">📊</div>
                  <h4 className="font-medium mb-2">Swing Metric</h4>
                  <p className="text-sm text-muted-foreground">Improve specific TrackMan data points like distance, accuracy, or club speed</p>
                </div>
                
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    goalType === 'handicap' ? 'border-primary bg-primary/10' : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => setGoalType('handicap')}
                >
                  <div className="text-3xl mb-3">🏆</div>
                  <h4 className="font-medium mb-2">Handicap</h4>
                  <p className="text-sm text-muted-foreground">Lower your overall handicap to reach the next skill level</p>
                </div>
              </div>

              {goalType === 'handicap' && !currentHandicap && (
                <div className="mt-6">
                  <Label htmlFor="current-handicap" className="text-base">📋 Enter Your Current Handicap</Label>
                  <Input
                    id="current-handicap"
                    type="number"
                    step="0.1"
                    value={handicapValue}
                    onChange={(e) => setHandicapValue(e.target.value)}
                    placeholder="e.g., 15.2"
                    className="mt-2 text-center text-lg h-12"
                  />
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button onClick={handleNext} disabled={!canProceedStep1} size="lg" className="px-8">
                  Continue <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Club Category (for data point goals) */}
          {step === 2 && goalType === 'data_point' && (
            <div className="space-y-6 text-center">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">🏌️ Select Club Category</h3>
                <p className="text-muted-foreground">Which type of clubs do you want to improve with?</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {CLUB_CATEGORIES.map((category) => (
                  <div 
                    key={category.value}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                      clubCategory === category.value ? 'border-primary bg-primary/10' : 'border-muted hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setClubCategory(category.value)}
                  >
                    <div className="text-3xl mb-3">{category.icon}</div>
                    <h4 className="font-medium mb-2">{category.label}</h4>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack} size="lg">
                  <ChevronLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button onClick={handleNext} disabled={!canProceedStep2} size="lg" className="px-8">
                  Continue <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Metric Selection (for data point) or Step 2: Handicap Target */}
          {((step === 3 && goalType === 'data_point') || (step === 2 && goalType === 'handicap')) && (
            <div className="space-y-6 text-center">
              {goalType === 'data_point' ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">📊 Choose Your Metric</h3>
                    <p className="text-muted-foreground">Select the TrackMan data point you want to improve</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {TRACKMAN_METRICS.map((metric) => (
                      <div 
                        key={metric.value}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedMetric === metric.value ? 'border-primary bg-primary/10' : 'border-muted hover:border-muted-foreground/50'
                        }`}
                        onClick={() => setSelectedMetric(metric.value)}
                      >
                        <div className="text-2xl mb-2">{metric.icon}</div>
                        <h4 className="font-medium text-sm">{metric.label}</h4>
                      </div>
                    ))}
                  </div>

                  {selectedMetric && (
                    <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-3">🎯 Set Your Target</h4>
                      {(() => {
                        const range = getTargetRanges(selectedMetric, clubCategory);
                        return (
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                              Good {clubCategory} range: {range.min} - {range.max} 
                              {selectedMetric.includes('Speed') && ' mph'}
                              {selectedMetric.includes('Distance') && ' yards'}
                              {selectedMetric.includes('Angle') && '°'}
                              {selectedMetric.includes('Spin') && ' rpm'}
                            </p>
                            <Input
                              type="number"
                              step="0.1"
                              value={targetValue}
                              onChange={(e) => setTargetValue(e.target.value)}
                              placeholder={`Target (suggested: ${range.good})`}
                              className="text-center text-lg h-12"
                            />
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">🏆 Set Your Handicap Goal</h3>
                    <p className="text-muted-foreground">What handicap do you want to achieve?</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Current Handicap</p>
                      <p className="text-2xl font-bold">{currentHandicap || handicapValue}</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="target-handicap" className="text-base">Target Handicap</Label>
                      <Input
                        id="target-handicap"
                        type="number"
                        step="0.1"
                        value={targetHandicap}
                        onChange={(e) => setTargetHandicap(e.target.value)}
                        placeholder="e.g., 12.0"
                        className="mt-2 text-center text-lg h-12"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack} size="lg">
                  <ChevronLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button onClick={handleNext} disabled={!canProceedStep3} size="lg" className="px-8">
                  Continue <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Final Step: Target Date */}
          {((step === 4 && goalType === 'data_point') || (step === 3 && goalType === 'handicap')) && (
            <div className="space-y-6 text-center">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">📅 When Do You Want to Achieve This?</h3>
                <p className="text-muted-foreground">Set a realistic deadline for your goal</p>
              </div>
              
              <div className="max-w-md mx-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className={cn(
                        "w-full justify-center text-left font-normal h-16 text-lg",
                        !targetDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5" />
                      {targetDate ? format(targetDate, "EEEE, MMMM do, yyyy") : "Pick a target date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
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

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack} size="lg">
                  <ChevronLeft className="mr-2 h-5 w-5" /> Back
                </Button>
                <Button onClick={handleSubmit} disabled={!targetDate || isLoading} size="lg" className="px-8">
                  {isLoading ? 'Creating Goal...' : '🎯 Create Goal'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};