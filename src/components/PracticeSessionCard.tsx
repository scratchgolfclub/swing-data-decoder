import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  TrendingUp, 
  TrendingDown,
  Minus, 
  BarChart3, 
  Calendar, 
  Target,
  ArrowRight,
  Timer,
  ChevronDown
} from 'lucide-react';
import { getStructuredMetrics, getMetricValue, type StructuredMetric } from '@/utils/structuredMetricsHelper';

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
  structured_metrics?: any;
  structured_baseline_metrics?: any;
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
  const [showOtherCategories, setShowOtherCategories] = useState(false);
  
  const latestProgress = progressData[0];
  const recentSessions = swingData.slice(0, 3);
  
  // Get latest swing and baseline for comparison
  const latestSwing = swingData[0];
  const baselineSwing = swingData.find(swing => swing.is_baseline);
  
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
  const getMetricValueFromSwing = (swing: SwingData, metricTitle: string): number => {
    const structuredMetrics = getStructuredMetrics(swing.structured_metrics || swing.structured_baseline_metrics);
    const structuredValue = getMetricValue(structuredMetrics, metricTitle);
    return structuredValue !== null ? structuredValue : 0;
  };

  // Get all available metrics categorized
  const getAllAvailableMetrics = () => {
    if (!latestSwing || !baselineSwing) return { speed: [], trajectory: [], direction: [], distance: [], impact: [] };
    
    const latestStructured = getStructuredMetrics(latestSwing.structured_metrics || latestSwing.structured_baseline_metrics);
    const baselineStructured = getStructuredMetrics(baselineSwing.structured_metrics || baselineSwing.structured_baseline_metrics);
    
    const metricTitles = new Set<string>();
    latestStructured.forEach(metric => metricTitles.add(metric.title));
    baselineStructured.forEach(metric => metricTitles.add(metric.title));
    
    const unitMap: Record<string, string> = {
      'Club Speed': 'mph', 'Ball Speed': 'mph', 'Smash Factor': '',
      'Launch Angle': '°', 'Attack Angle': '°', 'Face Angle': '°',
      'Club Path': '°', 'Face to Path': '°', 'Carry Distance': 'yds',
      'Total Distance': 'yds', 'Spin Rate': 'rpm', 'Launch Direction': '°',
      'Spin Axis': '°', 'Dynamic Loft': '°', 'Dynamic Lie': '°',
      'Impact Offset': 'mm', 'Low Point Distance': 'in', 'Curve': 'yds',
      'Height': 'ft', 'Landing Angle': '°', 'Hang Time': 's',
      'Side': 'yds', 'Side Total': 'yds'
    };

    const categories = {
      speed: ['Club Speed', 'Ball Speed', 'Smash Factor'],
      trajectory: ['Launch Angle', 'Attack Angle', 'Spin Rate', 'Height', 'Landing Angle', 'Hang Time'],
      direction: ['Face Angle', 'Club Path', 'Face to Path', 'Launch Direction', 'Spin Axis'],
      distance: ['Carry Distance', 'Total Distance', 'Curve', 'Side', 'Side Total'],
      impact: ['Dynamic Loft', 'Dynamic Lie', 'Impact Offset', 'Low Point Distance']
    };

    const result: Record<string, Array<{ key: string; label: string; unit: string }>> = {
      speed: [], trajectory: [], direction: [], distance: [], impact: []
    };
    
    Object.entries(categories).forEach(([category, metricNames]) => {
      metricNames.forEach(metricName => {
        if (metricTitles.has(metricName)) {
          result[category].push({
            key: metricName,
            label: metricName,
            unit: unitMap[metricName] || ''
          });
        }
      });
    });

    return result;
  };

  const renderTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

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
  const metrics = getAllAvailableMetrics();

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

        {/* Metric Comparison - Primary Element */}
        {latestSwing && baselineSwing && metrics.speed.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">Metric Comparison</h4>
              <span className="text-xs text-muted-foreground">vs. Baseline</span>
            </div>
            
            {/* Speed & Efficiency - Always Visible */}
            <div className="space-y-3">
              <h5 className="text-xs font-medium text-primary uppercase tracking-wide">
                Speed & Efficiency
              </h5>
              <div className="space-y-2">
                {metrics.speed.map(({ key, label, unit }) => {
                  const baselineValue = getMetricValueFromSwing(baselineSwing, key);
                  const latestValue = getMetricValueFromSwing(latestSwing, key);
                  
                  if (baselineValue === 0 && latestValue === 0) return null;
                  
                  const comparison = compareMetric(latestValue, baselineValue);

                  return (
                    <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40">
                      <div className="flex items-center space-x-2">
                        {renderTrendIcon(comparison.trend)}
                        <div>
                          <p className="text-xs font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">
                            {baselineValue.toFixed(1)}{unit} → {latestValue.toFixed(1)}{unit}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-medium ${
                          comparison.trend === 'up' ? 'text-green-500' : 
                          comparison.trend === 'down' ? 'text-red-500' : 
                          'text-muted-foreground'
                        }`}>
                          {comparison.difference > 0 ? '+' : ''}{comparison.difference.toFixed(1)}{unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.abs(comparison.percentChange).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Other Categories Dropdown */}
            {(metrics.trajectory.length > 0 || metrics.direction.length > 0 || metrics.distance.length > 0 || metrics.impact.length > 0) && (
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowOtherCategories(!showOtherCategories)}
                  className="flex items-center justify-between w-full p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <span className="text-xs font-medium text-foreground">
                    Other Metrics ({Object.values(metrics).flat().length - metrics.speed.length})
                  </span>
                  <ChevronDown 
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      showOtherCategories ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {showOtherCategories && (
                  <div className="mt-3 space-y-4 bg-background/50 border border-border/40 rounded-lg p-3">
                    {/* Trajectory & Spin */}
                    {metrics.trajectory.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                          Trajectory & Spin
                        </h5>
                        <div className="space-y-1">
                          {metrics.trajectory.map(({ key, label, unit }) => {
                            const baselineValue = getMetricValueFromSwing(baselineSwing, key);
                            const latestValue = getMetricValueFromSwing(latestSwing, key);
                            
                            if (baselineValue === 0 && latestValue === 0) return null;
                            
                            const comparison = compareMetric(latestValue, baselineValue);

                            return (
                              <div key={key} className="flex items-center justify-between p-2 rounded bg-muted/20">
                                <div className="flex items-center space-x-2">
                                  {renderTrendIcon(comparison.trend)}
                                  <div>
                                    <p className="text-xs font-medium text-foreground">{label}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {baselineValue.toFixed(1)}{unit} → {latestValue.toFixed(1)}{unit}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-xs font-medium ${
                                    comparison.trend === 'up' ? 'text-green-500' : 
                                    comparison.trend === 'down' ? 'text-red-500' : 
                                    'text-muted-foreground'
                                  }`}>
                                    {comparison.difference > 0 ? '+' : ''}{comparison.difference.toFixed(1)}{unit}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Direction & Face Control */}
                    {metrics.direction.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                          Direction & Face Control
                        </h5>
                        <div className="space-y-1">
                          {metrics.direction.map(({ key, label, unit }) => {
                            const baselineValue = getMetricValueFromSwing(baselineSwing, key);
                            const latestValue = getMetricValueFromSwing(latestSwing, key);
                            
                            if (baselineValue === 0 && latestValue === 0) return null;
                            
                            const comparison = compareMetric(latestValue, baselineValue);

                            return (
                              <div key={key} className="flex items-center justify-between p-2 rounded bg-muted/20">
                                <div className="flex items-center space-x-2">
                                  {renderTrendIcon(comparison.trend)}
                                  <div>
                                    <p className="text-xs font-medium text-foreground">{label}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {baselineValue.toFixed(1)}{unit} → {latestValue.toFixed(1)}{unit}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-xs font-medium ${
                                    comparison.trend === 'up' ? 'text-green-500' : 
                                    comparison.trend === 'down' ? 'text-red-500' : 
                                    'text-muted-foreground'
                                  }`}>
                                    {comparison.difference > 0 ? '+' : ''}{comparison.difference.toFixed(1)}{unit}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Distance & Accuracy */}
                    {metrics.distance.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
                          Distance & Accuracy
                        </h5>
                        <div className="space-y-1">
                          {metrics.distance.map(({ key, label, unit }) => {
                            const baselineValue = getMetricValueFromSwing(baselineSwing, key);
                            const latestValue = getMetricValueFromSwing(latestSwing, key);
                            
                            if (baselineValue === 0 && latestValue === 0) return null;
                            
                            const comparison = compareMetric(latestValue, baselineValue);

                            return (
                              <div key={key} className="flex items-center justify-between p-2 rounded bg-muted/20">
                                <div className="flex items-center space-x-2">
                                  {renderTrendIcon(comparison.trend)}
                                  <div>
                                    <p className="text-xs font-medium text-foreground">{label}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {baselineValue.toFixed(1)}{unit} → {latestValue.toFixed(1)}{unit}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-xs font-medium ${
                                    comparison.trend === 'up' ? 'text-green-500' : 
                                    comparison.trend === 'down' ? 'text-red-500' : 
                                    'text-muted-foreground'
                                  }`}>
                                    {comparison.difference > 0 ? '+' : ''}{comparison.difference.toFixed(1)}{unit}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Progress Summary - Fallback */}
        {(!latestSwing || !baselineSwing) && latestProgress && latestProgress.progress_summary && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Latest Insights</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {latestProgress.progress_summary}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};