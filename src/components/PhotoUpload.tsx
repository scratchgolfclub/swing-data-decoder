import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, Camera, HelpCircle } from "lucide-react";

interface PhotoUploadProps {
  selectedFile: File | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: () => void;
  canUpload: boolean;
}

export const PhotoUpload = ({ selectedFile, onFileSelect, onFileRemove, canUpload }: PhotoUploadProps) => {
  if (selectedFile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            2
          </div>
          <h3 className="text-lg font-semibold">Photo Selected</h3>
        </div>
        
        <div className="relative">
          <img 
            src={URL.createObjectURL(selectedFile)} 
            alt="Selected TrackMan data"
            className="max-w-full h-auto rounded-lg mx-auto max-h-96 object-contain"
          />
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={onFileRemove}
            variant="outline"
          >
            Choose Different Photo
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
            onChange={onFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="w-full h-20 cursor-pointer" asChild>
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6" />
                <span>Upload Photo</span>
              </div>
            </Button>
          </label>
        </div>

        <div>
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFileSelect}
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