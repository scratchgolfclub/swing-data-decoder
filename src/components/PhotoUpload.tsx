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
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            2
          </div>
          <h3 className="text-lg font-semibold">
            {selectedFiles.length === 1 ? 'Photo Selected' : `${selectedFiles.length} Photos Selected`}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative">
              <img 
                src={URL.createObjectURL(file)} 
                alt={`TrackMan data ${index + 1}`}
                className="w-full h-48 rounded-lg object-cover"
              />
              <Button 
                onClick={() => onFileRemove(index)}
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center gap-2">
          <Button 
            onClick={() => {
              const input = document.getElementById('file-upload') as HTMLInputElement;
              if (input) input.click();
            }}
            variant="outline"
          >
            Add More Photos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          canUpload ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          2
        </div>
        <h3 className={`text-lg font-semibold ${canUpload ? 'text-foreground' : 'text-muted-foreground'}`}>
          Upload or Take Photo
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <img 
                src="/lovable-uploads/d29e5f89-5e39-4a66-94f2-aa2ec156d29a.png" 
                alt="Example TrackMan data screenshot"
                className="w-full rounded"
              />
              <p className="mt-2 text-sm">Example: Take a clear photo of your TrackMan screen showing all the data points</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!canUpload ? 'opacity-50 pointer-events-none' : ''}`}>
        <div>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={onFilesSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="w-full h-20 cursor-pointer" asChild>
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6" />
                <span>Upload Photos</span>
              </div>
            </Button>
          </label>
        </div>

        <div>
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFilesSelect}
            className="hidden"
            id="camera-upload"
          />
          <label htmlFor="camera-upload">
            <Button variant="outline" className="w-full h-20 cursor-pointer" asChild>
              <div className="flex flex-col items-center gap-2">
                <Camera className="h-6 w-6" />
                <span>Take Photo</span>
              </div>
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
};