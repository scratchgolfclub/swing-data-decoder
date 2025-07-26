import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CompactInsightCardProps {
  type: 'strength' | 'weakness';
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export const CompactInsightCard = ({ 
  type, 
  title, 
  value, 
  description, 
  icon: Icon 
}: CompactInsightCardProps) => {
  const isStrength = type === 'strength';
  
  const getCardStyles = () => {
    if (isStrength) {
      return "bg-gradient-to-r from-primary-50/80 to-background border-l-4 border-l-primary-500 dark:from-primary-900/20 dark:border-l-primary-400";
    }
    return "bg-gradient-to-r from-warning-50/80 to-background border-l-4 border-l-warning dark:from-warning-900/20 dark:border-l-warning";
  };

  const getIconStyles = () => {
    if (isStrength) {
      return "text-primary-600 bg-primary-100 dark:text-primary-400 dark:bg-primary-900/30";
    }
    return "text-warning bg-warning-100 dark:text-warning dark:bg-warning-900/30";
  };

  const getTitleColor = () => {
    if (isStrength) {
      return "text-primary-700 dark:text-primary-300";
    }
    return "text-warning-700 dark:text-warning-300";
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${getCardStyles()}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg flex-shrink-0 ${getIconStyles()}`}>
            <Icon className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {isStrength ? 'STRENGTH' : 'FOCUS AREA'}
              </p>
              <span className="text-xs font-medium text-muted-foreground bg-background/60 px-2 py-0.5 rounded">
                {value}
              </span>
            </div>
            <h3 className={`font-semibold text-sm mb-1 ${getTitleColor()}`}>
              {title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};