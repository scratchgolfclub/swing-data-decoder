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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-semibold">Practice Drills</span>
          <Badge variant="outline" className="ml-auto text-xs bg-primary/5 text-primary border-primary/20">
            {uniqueDrills.length} drill{uniqueDrills.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {uniqueDrills.map((drill, index) => (
            <div 
              key={index}
              className="group relative p-4 rounded-xl bg-gradient-to-r from-primary/3 to-transparent border border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                    <span className="text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-relaxed pr-2">
                    {String(drill)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {uniqueDrills.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm text-foreground">
                <span className="font-semibold text-primary">Pro Tip:</span> Pick 1-2 drills to focus on during your next practice session. 
                Quality repetition beats quantity every time.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};