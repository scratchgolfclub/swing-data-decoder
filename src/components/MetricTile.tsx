import { Card, CardContent } from "@/components/ui/card";
import { StructuredMetric } from "@/utils/structuredMetricsHelper";

interface MetricTileProps {
  metric: StructuredMetric;
}

export const MetricTile = ({ metric }: MetricTileProps) => {
  return (
    <div className="p-3 bg-surface border border-border rounded-lg hover:bg-surface-elevated transition-colors">
      <div className="space-y-1">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {metric.title}
        </div>
        <div className="text-lg font-bold text-foreground">
          {metric.value}
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed">
          {metric.descriptor}
        </div>
      </div>
    </div>
  );
};