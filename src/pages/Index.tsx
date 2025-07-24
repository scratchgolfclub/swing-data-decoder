import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ResultsScreen } from "@/components/ResultsScreen";
import { ClubSelection } from "@/components/ClubSelection";
import { PhotoUpload } from "@/components/PhotoUpload";
import { extractTrackmanData } from "@/utils/ocrService";

const Index = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFilesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0 || !selectedClub) return;
    
    setIsLoading(true);
    try {
      const { extractMultipleTrackmanData } = await import('@/utils/ocrService');
      const data = await extractMultipleTrackmanData(selectedFiles);
      setResults({ swings: data, club: selectedClub });
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (results) {
    return <ResultsScreen data={results} onReset={() => { setResults(null); setSelectedFiles([]); }} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900 p-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/e186c3b0-ca71-4cc6-aed5-174afc8c4911.png" 
              alt="Scratch Golf Club" 
              className="h-20 w-auto object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            AI lessons based on your data
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Upload a photo of your TrackMan data and learn which lesson to watch
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-8 border">
          <div className="space-y-8">
            {/* Step 1: Club Selection */}
            <ClubSelection 
              selectedClub={selectedClub}
              onClubSelect={setSelectedClub}
            />
            
            {/* Step 2: Photo Upload */}
            <PhotoUpload 
              selectedFiles={selectedFiles}
              onFilesSelect={handleFilesSelect}
              onFileRemove={handleFileRemove}
              canUpload={!!selectedClub}
            />
            
            {/* Step 3: Submit */}
            {selectedFiles.length > 0 && selectedClub && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 justify-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <h3 className="text-lg font-semibold">Analyze Your Data</h3>
                </div>
                
                <div className="flex justify-center">
                  <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
                    Analyze My Swing{selectedFiles.length > 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;