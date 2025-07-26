import { Card, CardContent } from "@/components/ui/card";
import { StructuredMetric } from "@/utils/structuredMetricsHelper";

interface MetricTileProps {
  metric: StructuredMetric;
}

export const MetricTile = ({ metric }: MetricTileProps) => {
  return (
    <Card className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:shadow-md transition-shadow">
      <CardContent className="p-0 space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {metric.title}
        </div>
        <div className="text-2xl font-bold text-foreground">
          {metric.value}
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed">
          {metric.descriptor}
        </div>
      </CardContent>
    </Card>
  );
};