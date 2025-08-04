import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2 } from "lucide-react";

interface DrillsSectionProps {
  insights: any[];
}

export const DrillsSection = ({ insights }: DrillsSectionProps) => {
  // Extract all drills from insights
  const allDrills = insights.reduce((drills: string[], insight: any) => {
    if (insight.drills && Array.isArray(insight.drills)) {
      return [...drills, ...insight.drills.filter((drill: any): drill is string => typeof drill === 'string')];
    }
    return drills;
  }, []);

  // Remove duplicates and limit to top 6 drills
  const uniqueDrills = Array.from(new Set(allDrills)).slice(0, 6);

  if (uniqueDrills.length === 0) {
    return null;
  }

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-accent" />
          Drills to Work On
          <Badge variant="outline" className="ml-auto">
            {uniqueDrills.length} drill{uniqueDrills.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uniqueDrills.map((drill, index) => (
            <div 
              key={index}
              className="group p-4 rounded-lg border border-border hover:border-accent/30 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-accent">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed">
                    {String(drill)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {uniqueDrills.length > 0 && (
          <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Practice Tip:</span> Focus on 1-2 drills per session for best results. 
                Consistent practice with proper form is more effective than trying all drills at once.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};