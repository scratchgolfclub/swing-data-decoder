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
    return <ResultsScreen data={results} onReset={() => { setResults(null); setSelectedFiles([]); setSelectedClub(''); }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-muted">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(158,155,135,0.05),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(158,155,135,0.03),transparent_50%)]"></div>
      
      <div className="relative container-premium min-h-screen flex flex-col justify-center py-16 px-8">
        {/* Hero Section */}
        <div className="text-center mb-32 animate-fade-up pt-8">
          <div className="mb-20">
            <img 
              src="/lovable-uploads/5ee4c388-2e1d-4fb1-aa32-fa74da0d32e4.png" 
              alt="Scratch Golf Club Logo" 
              className="h-16 w-auto mx-auto mb-20 animate-premium opacity-90 hover:opacity-100 transition-opacity duration-700"
            />
          </div>
          
          <h1 className="mb-12 text-premium leading-none overflow-visible">
            <span className="gradient-text-premium block leading-normal py-1">Analyze</span>
            <span className="text-foreground/70 font-light block mt-4">My Swing</span>
          </h1>
          
          <div className="max-w-2xl mx-auto space-y-8">
            <p className="text-xl text-premium-muted leading-relaxed">
              Upload your TrackMan data and discover which lesson to watch next
            </p>
            
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground/60">
              <div className="w-1 h-1 bg-primary/60 rounded-full"></div>
              <span>Powered by professional golf instruction</span>
              <div className="w-1 h-1 bg-primary/60 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="max-w-4xl mx-auto animate-scale-in">
          <div className="premium-card p-16">
            <div className="space-y-20">
              {/* Step 1: Club Selection */}
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-600 text-primary-foreground flex items-center justify-center text-lg font-medium shadow-button">
                    1
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-2xl font-medium text-premium mb-2">Select Your Club</h3>
                    <p className="text-premium-muted">Choose the club you hit for this session</p>
                  </div>
                </div>
                
                <div className="ml-20">
                  <ClubSelection 
                    selectedClub={selectedClub}
                    onClubSelect={setSelectedClub}
                  />
                </div>
              </div>
              
              {/* Step 2: Photo Upload */}
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-medium transition-all duration-500 ${
                    selectedClub 
                      ? 'bg-gradient-to-br from-primary to-primary-600 text-primary-foreground shadow-button' 
                      : 'bg-muted text-muted-foreground/70'
                  }`}>
                    2
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-2xl font-medium text-premium mb-2">Upload Your Data</h3>
                    <p className="text-premium-muted">Take or upload photos of your TrackMan screen</p>
                  </div>
                </div>
                
                <div className="ml-20">
                  <PhotoUpload 
                    selectedFiles={selectedFiles}
                    onFilesSelect={handleFilesSelect}
                    onFileRemove={handleFileRemove}
                    canUpload={!!selectedClub}
                  />
                </div>
              </div>
              
              {/* Step 3: Submit */}
              {selectedFiles.length > 0 && selectedClub && (
                <div className="space-y-8 animate-slide-up">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-600 text-primary-foreground flex items-center justify-center text-lg font-medium shadow-button">
                      3
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-2xl font-medium text-premium mb-2">Get Your Analysis</h3>
                      <p className="text-premium-muted">AI will analyze your swing data</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-8 ml-20">
                    <Button 
                      onClick={handleSubmit} 
                      className="btn-premium px-12 py-4 text-lg font-medium rounded-2xl text-primary-foreground"
                    >
                      <span className="relative z-10">
                        Analyze My Swing{selectedFiles.length > 1 ? 's' : ''}
                      </span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-24 animate-fade-in">
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground/50">
            <span>Professional Analysis</span>
            <div className="w-1 h-1 bg-muted-foreground/20 rounded-full"></div>
            <span>Instant Results</span>
            <div className="w-1 h-1 bg-muted-foreground/20 rounded-full"></div>
            <span>Expert Recommendations</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;