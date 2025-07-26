import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface InsightCardProps {
  type: 'strength' | 'weakness';
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export const InsightCard = ({ 
  type, 
  title, 
  value, 
  description, 
  icon: Icon 
}: InsightCardProps) => {
  const isStrength = type === 'strength';
  
  const getCardStyles = () => {
    if (isStrength) {
      return "bg-gradient-to-br from-primary-50 to-primary-100/80 border-l-4 border-l-primary-500 border-t border-r border-b border-primary-200/60 dark:from-primary-900/20 dark:to-primary-800/10 dark:border-l-primary-400 dark:border-primary-700/40";
    }
    return "bg-gradient-to-br from-warning-50/80 to-orange-50/60 border-l-4 border-l-warning border-t border-r border-b border-orange-200/60 dark:from-warning-900/20 dark:to-orange-900/10 dark:border-l-warning dark:border-orange-700/40";
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
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${getCardStyles()}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${getIconStyles()}`}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold text-lg ${getTitleColor()}`}>
                  {title}
                </h3>
                <span className="text-sm font-medium text-muted-foreground bg-background/60 px-2 py-1 rounded-lg">
                  {value}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                {isStrength ? 'STRENGTH' : 'FOCUS AREA'}
              </p>
            </div>
            
            <p className="text-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};