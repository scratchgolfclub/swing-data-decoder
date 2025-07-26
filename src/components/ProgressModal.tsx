import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getStructuredMetrics, getMetricValue, type StructuredMetric } from '@/utils/structuredMetricsHelper';

interface SwingData {
  id: string;
  session_name: string;
  club_type: string;
  structured_metrics: StructuredMetric[];
  structured_baseline_metrics: StructuredMetric[];
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

  // Extract key metrics for comparison using structured format only
  const getMetricValueFromSwing = (swing: SwingData, metricTitle: string): number => {
    const structuredMetrics = getStructuredMetrics(swing.structured_metrics || swing.structured_baseline_metrics);
    const structuredValue = getMetricValue(structuredMetrics, metricTitle);
    return structuredValue !== null ? structuredValue : 0;
  };

  // Dynamically detect all available metrics from both swings
  const getAllAvailableMetrics = () => {
    const latestStructured = getStructuredMetrics(latestSwing.structured_metrics || latestSwing.structured_baseline_metrics);
    const baselineStructured = getStructuredMetrics(baselineSwing.structured_metrics || baselineSwing.structured_baseline_metrics);
    
    const metricTitles = new Set<string>();
    
    // Collect unique metric titles from both swings
    latestStructured.forEach(metric => metricTitles.add(metric.title));
    baselineStructured.forEach(metric => metricTitles.add(metric.title));
    
    // Define unit mappings for metrics
    const unitMap: Record<string, string> = {
      'Club Speed': 'mph',
      'Ball Speed': 'mph', 
      'Smash Factor': '',
      'Launch Angle': '°',
      'Attack Angle': '°',
      'Face Angle': '°',
      'Club Path': '°',
      'Face to Path': '°',
      'Carry Distance': 'yds',
      'Total Distance': 'yds',
      'Spin Rate': 'rpm',
      'Launch Direction': '°',
      'Spin Axis': '°',
      'Dynamic Loft': '°',
      'Dynamic Lie': '°',
      'Impact Offset': 'mm',
      'Low Point Distance': 'in',
      'Curve': 'yds',
      'Height': 'ft',
      'Landing Angle': '°',
      'Hang Time': 's',
      'Side': 'yds',
      'Side Total': 'yds'
    };

    // Define categories for better organization
    const categories = {
      speed: ['Club Speed', 'Ball Speed', 'Smash Factor'],
      trajectory: ['Launch Angle', 'Attack Angle', 'Spin Rate', 'Height', 'Landing Angle', 'Hang Time'],
      direction: ['Face Angle', 'Club Path', 'Face to Path', 'Launch Direction', 'Spin Axis'],
      distance: ['Carry Distance', 'Total Distance', 'Curve', 'Side', 'Side Total'],
      impact: ['Dynamic Loft', 'Dynamic Lie', 'Impact Offset', 'Low Point Distance']
    };

    const sortedMetrics: Array<{ key: string; label: string; unit: string; category: string }> = [];
    
    // Sort metrics by category priority
    Object.entries(categories).forEach(([category, metricNames]) => {
      metricNames.forEach(metricName => {
        if (metricTitles.has(metricName)) {
          sortedMetrics.push({
            key: metricName,
            label: metricName,
            unit: unitMap[metricName] || '',
            category
          });
        }
      });
    });

    // Add any remaining metrics not in categories
    Array.from(metricTitles).forEach(title => {
      if (!sortedMetrics.find(m => m.key === title)) {
        sortedMetrics.push({
          key: title,
          label: title,
          unit: unitMap[title] || '',
          category: 'other'
        });
      }
    });

    return sortedMetrics;
  };

  const metrics = getAllAvailableMetrics();

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
            <div className="space-y-6">
              {/* Group metrics by category */}
              {Object.entries(
                metrics.reduce((groups, metric) => {
                  const category = metric.category;
                  if (!groups[category]) groups[category] = [];
                  groups[category].push(metric);
                  return groups;
                }, {} as Record<string, typeof metrics>)
              ).map(([category, categoryMetrics]) => (
                <div key={category}>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                    {category === 'speed' ? 'Speed & Efficiency' : 
                     category === 'trajectory' ? 'Trajectory & Spin' :
                     category === 'direction' ? 'Direction & Face Control' :
                     category === 'distance' ? 'Distance & Accuracy' :
                     category === 'impact' ? 'Impact Dynamics' : 'Other Metrics'}
                  </h4>
                  <div className="space-y-2">
                    {categoryMetrics.map(({ key, label, unit }) => {
                      const baselineValue = getMetricValueFromSwing(baselineSwing, key);
                      const latestValue = getMetricValueFromSwing(latestSwing, key);
                      
                      // Skip if no valid values
                      if (baselineValue === 0 && latestValue === 0) return null;
                      
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
                </div>
              ))}
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