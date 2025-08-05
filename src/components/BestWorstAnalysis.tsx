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
            reason = value >= 1.45 ? 'Excellent energy transfer - perfect contact' : 
                    value >= 1.40 ? 'Solid contact quality' : 'Contact quality can improve';
          }
          break;
        
        case 'club speed':
          // Higher is generally better, but context matters
          score = clubType === 'driver' ? (value >= 105 ? 90 : value >= 95 ? 70 : 50) : 
                  clubType.includes('iron') ? (value >= 85 ? 90 : value >= 75 ? 70 : 50) : 60;
          reason = `${score >= 80 ? 'Great swing speed' : score >= 60 ? 'Good swing speed' : 'Room to increase speed'} with ${clubType}`;
          break;

        case 'attack angle':
          if (clubType === 'driver') {
            const optimal = value >= 1 && value <= 5;
            score = optimal ? 95 : Math.abs(value) <= 2 ? 70 : 40;
            reason = optimal ? 'Perfect launch angle setup' : 
                    value < -2 ? 'Hit up more for better distance' : 
                    'Small adjustment needed for optimal launch';
          }
          break;

        case 'club path':
          const pathScore = Math.abs(value) <= 2 ? 90 : Math.abs(value) <= 4 ? 70 : 40;
          score = pathScore;
          reason = Math.abs(value) <= 2 ? 'Great swing path control' : 
                  Math.abs(value) <= 4 ? 'Minor path adjustment needed' : 
                  `Swing path needs work for straighter shots`;
          break;

        case 'face angle':
          const faceScore = Math.abs(value) <= 1 ? 95 : Math.abs(value) <= 2 ? 80 : 50;
          score = faceScore;
          reason = Math.abs(value) <= 1 ? 'Perfect face control at impact' : 
                  Math.abs(value) <= 2 ? 'Good clubface position' : 
                  'Focus on clubface position for accuracy';
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
    <Card className="bg-gradient-to-r from-primary/5 via-surface to-warning/5 border border-border mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          {/* Best Performing Metric */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-primary">Your Best</span>
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                  {best.score}/100
                </Badge>
              </div>
              <h4 className="font-semibold text-foreground truncate mb-1">
                {best.metric.title}: {best.metric.value}
              </h4>
            </div>
          </div>

          {/* Separator */}
          <div className="hidden lg:block w-px bg-border"></div>
          <div className="lg:hidden h-px bg-border"></div>

          {/* Worst Performing Metric */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-warning/10 border border-warning/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-warning">Focus Area</span>
                <Badge variant="outline" className="text-xs bg-warning/5 text-warning border-warning/20">
                  {worst.score}/100
                </Badge>
              </div>
              <h4 className="font-semibold text-foreground truncate mb-1">
                {worst.metric.title}: {worst.metric.value}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {worst.reason}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
