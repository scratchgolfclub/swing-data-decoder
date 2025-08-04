import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Star, AlertTriangle } from "lucide-react";
import { type StructuredMetric } from "@/utils/structuredMetricsHelper";

interface BestWorstAnalysisProps {
  metrics: StructuredMetric[];
  clubType: string;
}

interface AnalysisResult {
  metric: StructuredMetric;
  reason: string;
  score: number;
}

export const BestWorstAnalysis = ({ metrics, clubType }: BestWorstAnalysisProps) => {
  const analyzeMetrics = (): { best: AnalysisResult | null; worst: AnalysisResult | null } => {
    if (!metrics.length) return { best: null, worst: null };

    const analyses: AnalysisResult[] = [];

    metrics.forEach(metric => {
      const value = parseFloat(String(metric.value).replace(/[^\d.-]/g, ''));
      if (isNaN(value)) return;

      let score = 0;
      let reason = '';

      // Analysis based on metric type and club
      switch (metric.title.toLowerCase()) {
        case 'smash factor':
          if (clubType === 'driver') {
            score = value >= 1.45 ? 100 : value >= 1.40 ? 80 : value >= 1.35 ? 60 : 30;
            reason = value >= 1.45 ? 'Excellent energy transfer - hitting the sweet spot consistently' : 
                    value >= 1.40 ? 'Good solid contact' : 'Room for improvement in strike quality';
          }
          break;
        
        case 'club speed':
          // Higher is generally better, but context matters
          score = clubType === 'driver' ? (value >= 105 ? 90 : value >= 95 ? 70 : 50) : 
                  clubType.includes('iron') ? (value >= 85 ? 90 : value >= 75 ? 70 : 50) : 60;
          reason = `${score >= 80 ? 'Strong' : score >= 60 ? 'Average' : 'Below average'} swing speed for ${clubType}`;
          break;

        case 'attack angle':
          if (clubType === 'driver') {
            const optimal = value >= 1 && value <= 5;
            score = optimal ? 95 : Math.abs(value) <= 2 ? 70 : 40;
            reason = optimal ? 'Ideal upward strike for maximum distance' : 
                    value < -2 ? 'Too steep - losing distance and trajectory' : 
                    'Room to optimize launch conditions';
          }
          break;

        case 'club path':
          const pathScore = Math.abs(value) <= 2 ? 90 : Math.abs(value) <= 4 ? 70 : 40;
          score = pathScore;
          reason = Math.abs(value) <= 2 ? 'Excellent swing path control' : 
                  Math.abs(value) <= 4 ? 'Minor path deviation' : 
                  `${value > 0 ? 'Too much in-to-out' : 'Too much out-to-in'} - affecting ball flight`;
          break;

        case 'face angle':
          const faceScore = Math.abs(value) <= 1 ? 95 : Math.abs(value) <= 2 ? 80 : 50;
          score = faceScore;
          reason = Math.abs(value) <= 1 ? 'Excellent face control at impact' : 
                  Math.abs(value) <= 2 ? 'Good face position' : 
                  'Face angle needs attention for straighter shots';
          break;

        default:
          score = 60; // Neutral score for unanalyzed metrics
          reason = 'Metric within normal range';
      }

      analyses.push({ metric, reason, score });
    });

    if (!analyses.length) return { best: null, worst: null };

    const best = analyses.reduce((prev, curr) => prev.score > curr.score ? prev : curr);
    const worst = analyses.reduce((prev, curr) => prev.score < curr.score ? prev : curr);

    return { best, worst };
  };

  const { best, worst } = analyzeMetrics();

  if (!best || !worst) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Best Performing Metric */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Star className="h-5 w-5" />
            Best Data Point
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">{best.metric.title}</span>
              <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                {best.metric.value} {best.metric.descriptor}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Performance Score: {best.score}/100
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {best.reason}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Worst Performing Metric */}
      <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            Needs Most Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">{worst.metric.title}</span>
              <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                {worst.metric.value} {worst.metric.descriptor}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">
                Performance Score: {worst.score}/100
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {worst.reason}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};