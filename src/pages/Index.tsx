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
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(142,76,36,0.1),transparent_50%)]"></div>
      
      <div className="relative flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-up">
            <div className="mb-8">
              <img 
                src="/lovable-uploads/8ca06ed2-bd76-4910-ad83-6e8259bf704b.png" 
                alt="SGC Logo" 
                className="h-24 w-auto mx-auto mb-8 transition-all duration-300 hover:scale-110 hover:-translate-y-2 drop-shadow-xl hover:drop-shadow-2xl cursor-pointer"
              />
            </div>
            
            <h1 className="text-7xl md:text-8xl font-display font-bold mb-6 tracking-tight">
              <span className="gradient-text">Analyze</span>
              <br />
              <span className="text-foreground/80">My Swing</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-light leading-relaxed max-w-2xl mx-auto">
              Upload your TrackMan data and discover which lesson to watch next
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/70">
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
              <span>Powered by professional golf instruction</span>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Main Card */}
          <div className="modern-card p-10 max-w-2xl mx-auto animate-scale-in">
            <div className="space-y-12">
              {/* Step 1: Club Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-600 text-primary-foreground flex items-center justify-center text-lg font-bold shadow-glow">
                    1
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-semibold">Select Your Club</h3>
                    <p className="text-muted-foreground">Choose the club you hit for this session</p>
                  </div>
                </div>
                
                <ClubSelection 
                  selectedClub={selectedClub}
                  onClubSelect={setSelectedClub}
                />
              </div>
              
              {/* Step 2: Photo Upload */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                    selectedClub 
                      ? 'bg-gradient-to-br from-primary to-primary-600 text-primary-foreground shadow-glow' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    2
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-semibold">Upload Your Data</h3>
                    <p className="text-muted-foreground">Take or upload photos of your TrackMan screen</p>
                  </div>
                </div>
                
                <PhotoUpload 
                  selectedFiles={selectedFiles}
                  onFilesSelect={handleFilesSelect}
                  onFileRemove={handleFileRemove}
                  canUpload={!!selectedClub}
                />
              </div>
              
              {/* Step 3: Submit */}
              {selectedFiles.length > 0 && selectedClub && (
                <div className="space-y-6 animate-slide-up">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-600 text-primary-foreground flex items-center justify-center text-lg font-bold shadow-glow">
                      3
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-semibold">Get Your Analysis</h3>
                      <p className="text-muted-foreground">AI will analyze your swing data</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <Button 
                      onClick={handleSubmit} 
                      className="modern-button bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-primary-foreground px-12 py-4 text-lg font-semibold rounded-2xl shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-300"
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
          
          {/* Footer */}
          <div className="text-center mt-16 space-y-4 animate-fade-in">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground/60">
              <span>Professional Analysis</span>
              <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
              <span>Instant Results</span>
              <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
              <span>Expert Recommendations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;