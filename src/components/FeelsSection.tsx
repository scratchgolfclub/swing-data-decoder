import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb } from "lucide-react";

interface FeelsSectionProps {
  insights: any[];
}

export const FeelsSection = ({ insights }: FeelsSectionProps) => {
  // Extract all feels from insights
  const allFeels = insights.reduce((feels: string[], insight: any) => {
    if (insight.feels && Array.isArray(insight.feels)) {
      return [...feels, ...insight.feels.filter((feel: any): feel is string => typeof feel === 'string')];
    }
    return feels;
  }, []);

  // Remove duplicates and limit to top 6 feels
  const uniqueFeels = Array.from(new Set(allFeels)).slice(0, 6) as string[];

  if (uniqueFeels.length === 0) {
    return null;
  }

  // Categorize feels by swing phase (simple keyword matching)
  const categorizeFeels = (feels: string[]) => {
    const categories: Record<string, string[]> = {
      'Setup & Address': [],
      'Backswing': [],
      'Downswing & Impact': [],
      'General Feel': []
    };

    feels.forEach(feel => {
      const lowerFeel = feel.toLowerCase();
      if (lowerFeel.includes('setup') || lowerFeel.includes('address') || lowerFeel.includes('posture')) {
        categories['Setup & Address'].push(feel);
      } else if (lowerFeel.includes('backswing') || lowerFeel.includes('takeaway') || lowerFeel.includes('top')) {
        categories['Backswing'].push(feel);
      } else if (lowerFeel.includes('downswing') || lowerFeel.includes('impact') || lowerFeel.includes('through') || lowerFeel.includes('contact')) {
        categories['Downswing & Impact'].push(feel);
      } else {
        categories['General Feel'].push(feel);
      }
    });

    return categories;
  };

  const categorizedFeels = categorizeFeels(uniqueFeels);

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-accent" />
          Feels to Think About
          <Badge variant="outline" className="ml-auto">
            {uniqueFeels.length} feel{uniqueFeels.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(categorizedFeels).map(([category, feels]) => {
            if (feels.length === 0) return null;
            
            return (
              <div key={category}>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-sm">{category}</span>
                  <Badge variant="secondary" className="text-xs">
                    {feels.length}
                  </Badge>
                </h4>
                <div className="space-y-3">
                  {feels.map((feel, index) => (
                    <div 
                      key={index}
                      className="group p-3 rounded-lg bg-accent/5 border border-accent/10 hover:border-accent/20 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <Lightbulb className="h-4 w-4 text-accent" />
                        </div>
                        <p className="text-sm text-foreground leading-relaxed italic">
                          "{String(feel)}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {uniqueFeels.length > 0 && (
          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
            <div className="flex items-start gap-2">
              <Brain className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Mental Approach:</span> Use these feels as mental cues during practice. 
                Focus on one feel at a time and let it guide your swing naturally.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};