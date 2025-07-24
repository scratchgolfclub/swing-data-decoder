import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, Camera, HelpCircle } from "lucide-react";

interface PhotoUploadProps {
  selectedFiles: File[];
  onFilesSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: (index: number) => void;
  canUpload: boolean;
}

export const PhotoUpload = ({ selectedFiles, onFilesSelect, onFileRemove, canUpload }: PhotoUploadProps) => {
  if (selectedFiles.length > 0) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative group">
              <div className="relative overflow-hidden rounded-2xl border-2 border-border bg-card">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={`TrackMan data ${index + 1}`}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Button 
                  onClick={() => onFileRemove(index)}
                  variant="destructive"
                  size="sm"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                >
                  Remove
                </Button>
                <div className="absolute bottom-3 left-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Photo {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={() => {
              const input = document.getElementById('file-upload') as HTMLInputElement;
              if (input) input.click();
            }}
            variant="outline"
            className="rounded-2xl px-8 py-3 border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 transition-all duration-300"
          >
            <Upload className="h-5 w-5 mr-2" />
            Add More Photos
          </Button>
        </div>
        
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={onFilesSelect}
          className="hidden"
          id="file-upload"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 ${
        !canUpload ? 'opacity-50 pointer-events-none' : ''
      }`}>
        <div className="group">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={onFilesSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="block">
            <div className="relative h-32 rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer group-hover:scale-105 transform">
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground">Upload Photos</div>
                  <div className="text-sm text-muted-foreground">Drag & drop or click</div>
                </div>
              </div>
            </div>
          </label>
        </div>

        <div className="group">
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFilesSelect}
            className="hidden"
            id="camera-upload"
          />
          <label htmlFor="camera-upload" className="block">
            <div className="relative h-32 rounded-2xl border-2 border-dashed border-border bg-card hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer group-hover:scale-105 transform">
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground">Take Photo</div>
                  <div className="text-sm text-muted-foreground">Use your camera</div>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>
      
      {canUpload && (
        <div className="text-center p-6 bg-accent/30 rounded-2xl border border-accent/50">
          <HelpCircle className="h-8 w-8 text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Take clear photos of your TrackMan screen showing all data points. You can upload multiple swings for better analysis.
          </p>
        </div>
      )}
    </div>
  );
};