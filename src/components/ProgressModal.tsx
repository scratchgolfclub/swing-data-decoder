import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SwingData {
  id: string;
  session_name: string;
  club_type: string;
  initial_metrics: any;
  swing_score: number;
  created_at: string;
  coaching_notes: string;
}

interface ProgressData {
  overall_score: number;
  progress_summary: string;
  strengths: string[];
  improvement_areas: string[];
  notes: string;
}

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  latestSwing: SwingData;
  baselineSwing: SwingData;
  progressData?: ProgressData;
}

const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  onClose,
  latestSwing,
  baselineSwing,
  progressData
}) => {
  // Helper function to compare metrics
  const compareMetric = (latest: number, baseline: number) => {
    const difference = latest - baseline;
    const percentChange = baseline !== 0 ? (difference / baseline) * 100 : 0;
    
    return {
      difference,
      percentChange,
      trend: difference > 0 ? 'up' : difference < 0 ? 'down' : 'same'
    };
  };

  // Extract key metrics for comparison
  const getMetricValue = (metrics: any, key: string): number => {
    const value = metrics?.[key];
    if (typeof value === 'string') {
      return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
    }
    return value || 0;
  };

  const metrics = [
    { key: 'clubSpeed', label: 'Club Speed', unit: 'mph' },
    { key: 'ballSpeed', label: 'Ball Speed', unit: 'mph' },
    { key: 'launchAngle', label: 'Launch Angle', unit: '°' },
    { key: 'carryDistance', label: 'Carry Distance', unit: 'yds' },
    { key: 'smashFactor', label: 'Smash Factor', unit: '' }
  ];

  const renderTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Progress Report</DialogTitle>
          <DialogDescription>
            Comparing your latest swing against your baseline
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Baseline Swing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Baseline Swing
                <Badge variant="secondary">Starting Point</Badge>
              </CardTitle>
              <CardDescription>
                {new Date(baselineSwing.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Session:</span>
                  <span className="text-sm font-medium">{baselineSwing.session_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Club:</span>
                  <span className="text-sm font-medium">{baselineSwing.club_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Score:</span>
                  <span className="text-sm font-medium">{baselineSwing.swing_score}/100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Latest Swing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Latest Swing
                <Badge variant="default">Current</Badge>
              </CardTitle>
              <CardDescription>
                {new Date(latestSwing.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Session:</span>
                  <span className="text-sm font-medium">{latestSwing.session_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Club:</span>
                  <span className="text-sm font-medium">{latestSwing.club_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Score:</span>
                  <span className="text-sm font-medium">{latestSwing.swing_score}/100</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Metrics Comparison</CardTitle>
            <CardDescription>
              Changes from baseline to latest swing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.map(({ key, label, unit }) => {
                const baselineValue = getMetricValue(baselineSwing.initial_metrics, key);
                const latestValue = getMetricValue(latestSwing.initial_metrics, key);
                const comparison = compareMetric(latestValue, baselineValue);

                return (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-3">
                      {renderTrendIcon(comparison.trend)}
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          {baselineValue.toFixed(1)}{unit} → {latestValue.toFixed(1)}{unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        comparison.trend === 'up' ? 'text-green-500' : 
                        comparison.trend === 'down' ? 'text-red-500' : 
                        'text-muted-foreground'
                      }`}>
                        {comparison.difference > 0 ? '+' : ''}{comparison.difference.toFixed(1)}{unit}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Math.abs(comparison.percentChange).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Swing Score Progress</span>
                  <span className="text-sm">{latestSwing.swing_score}/100</span>
                </div>
                <Progress value={latestSwing.swing_score} className="h-2" />
              </div>

              {progressData && (
                <>
                  {progressData.strengths?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-green-600">Strengths</h4>
                      <div className="flex flex-wrap gap-2">
                        {progressData.strengths.map((strength, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-50 text-green-700">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {progressData.improvement_areas?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-orange-600">Areas for Improvement</h4>
                      <div className="flex flex-wrap gap-2">
                        {progressData.improvement_areas.map((area, index) => (
                          <Badge key={index} variant="secondary" className="bg-orange-50 text-orange-700">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {progressData.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-sm text-muted-foreground">{progressData.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressModal;