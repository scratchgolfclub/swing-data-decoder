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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shadow-sm">
            <Brain className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold">Swing Feels</span>
          <Badge variant="outline" className="ml-auto text-xs bg-accent/5 text-accent border-accent/20">
            {uniqueFeels.length} feel{uniqueFeels.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-6">
          {Object.entries(categorizedFeels).map(([category, feels]) => {
            if (feels.length === 0) return null;
            
            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <h4 className="font-semibold text-foreground text-sm">
                    {category}
                  </h4>
                  <Badge variant="secondary" className="text-xs bg-accent/10 text-accent border-accent/20">
                    {feels.length}
                  </Badge>
                </div>
                <div className="space-y-3 ml-5">
                  {feels.map((feel, index) => (
                    <div 
                      key={index}
                      className="group relative p-4 rounded-xl bg-gradient-to-r from-accent/5 to-transparent border border-accent/15 hover:border-accent/25 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-sm">
                            <Lightbulb className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="text-sm font-medium text-foreground leading-relaxed italic">
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
          <div className="mt-6 p-4 bg-gradient-to-r from-accent/5 to-accent/10 border border-accent/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <div className="text-sm text-foreground">
                <span className="font-semibold text-accent">Mental Game:</span> Choose one feel to focus on during your next swing. 
                Let it guide your movement naturally without overthinking.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};