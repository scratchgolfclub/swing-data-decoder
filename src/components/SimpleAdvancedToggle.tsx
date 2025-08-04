import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface SimpleAdvancedToggleProps {
  isSimpleView: boolean;
  onToggle: (isSimple: boolean) => void;
}

export const SimpleAdvancedToggle = ({ isSimpleView, onToggle }: SimpleAdvancedToggleProps) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-sm text-muted-foreground font-medium">View:</span>
      <ToggleGroup 
        type="single" 
        value={isSimpleView ? "simple" : "advanced"} 
        onValueChange={(value) => onToggle(value === "simple")}
        className="bg-surface border border-border rounded-lg p-1"
      >
        <ToggleGroupItem 
          value="simple" 
          className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground px-4 py-2"
        >
          Simple
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="advanced" 
          className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground px-4 py-2"
        >
          Advanced
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};