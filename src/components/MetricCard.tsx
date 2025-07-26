import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  variant?: 'default' | 'gradient' | 'accent';
}

export const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  variant = 'default' 
}: MetricCardProps) => {
  const getCardStyles = () => {
    switch (variant) {
      case 'gradient':
        return "bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200/50 dark:from-primary-900/20 dark:to-primary-800/20 dark:border-primary-700/30";
      case 'accent':
        return "bg-gradient-to-br from-surface to-surface-elevated border-border/50 dark:from-surface-muted/50 dark:to-surface/30";
      default:
        return "bg-card border-border/60 dark:bg-card/50";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'gradient':
        return "text-primary-600 dark:text-primary-400";
      case 'accent':
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-elegant hover:scale-105 ${getCardStyles()}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground tracking-wide">
              {title}
            </p>
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {value}
              </p>
              {change && (
                <p className="text-xs text-muted-foreground font-medium">
                  {change}
                </p>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-2xl bg-background/60 backdrop-blur-sm ${getIconStyles()}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-50" />
        )}
      </CardContent>
    </Card>
  );
};