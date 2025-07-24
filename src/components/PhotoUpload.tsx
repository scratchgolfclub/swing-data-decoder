import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Camera } from "lucide-react";

interface PhotoUploadProps {
  selectedFile: File | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: () => void;
}

export const PhotoUpload = ({ selectedFile, onFileSelect, onFileRemove }: PhotoUploadProps) => {
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
        <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
          2
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground">Upload or Take Photo</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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