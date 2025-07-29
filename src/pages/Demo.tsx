import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhotoUpload } from "@/components/PhotoUpload";
import { ClubSelection } from "@/components/ClubSelection";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ResultsScreen } from "@/components/ResultsScreen";
import { extractTrackmanData } from "@/utils/ocrService";
import scratchLogo from "@/assets/scratch-golf-logo.png";
import { Sparkles, TrendingUp, Target } from "lucide-react";

const Demo = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFilesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0 || !selectedClub) return;

    setIsLoading(true);
    try {
      const { extractMultipleTrackmanData } = await import('@/utils/ocrService');
      const data = await extractMultipleTrackmanData(selectedFiles, 'demo-user');
      setResults({ swings: data, club: selectedClub });
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setSelectedClub("");
    setResults(null);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (results) {
    return <ResultsScreen data={results} onReset={handleReset} isDemoMode={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Demo Badge */}
      <div className="fixed top-4 right-4 z-50">
        <Badge variant="secondary" className="text-sm font-medium">
          Demo Mode
        </Badge>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-6">
            <img 
              src={scratchLogo} 
              alt="Scratch Golf Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Swing Analysis Demo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Try our AI-powered golf swing analysis tool. Upload your TrackMan data 
            and get instant insights into your performance.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-primary/10 shadow-xl backdrop-blur-sm bg-card/95">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">Analyze Your Swing</CardTitle>
              <CardDescription className="text-base">
                Upload TrackMan images and select your club to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Step 1: Club Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <h3 className="text-lg font-semibold">Select Your Club</h3>
                </div>
                <ClubSelection selectedClub={selectedClub} onClubSelect={setSelectedClub} />
              </div>

              {/* Step 2: Photo Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h3 className="text-lg font-semibold">Upload TrackMan Images</h3>
                </div>
                <PhotoUpload 
                  onFilesSelect={handleFilesSelect}
                  onFileRemove={handleFileRemove}
                  selectedFiles={selectedFiles}
                  canUpload={!!selectedClub}
                />
              </div>

              {/* Step 3: Analyze */}
              {selectedClub && selectedFiles.length > 0 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <h3 className="text-lg font-semibold">Get Your Analysis</h3>
                  </div>
                  <Button 
                    onClick={handleSubmit}
                    className="w-full text-lg py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze My Swing
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="flex flex-col items-center space-y-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h4 className="font-semibold">AI-Powered Insights</h4>
              <p className="text-sm text-muted-foreground">Advanced analysis of your swing metrics</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h4 className="font-semibold">Performance Tracking</h4>
              <p className="text-sm text-muted-foreground">Monitor improvement over time</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Target className="h-8 w-8 text-primary" />
              <h4 className="font-semibold">Personalized Tips</h4>
              <p className="text-sm text-muted-foreground">Targeted recommendations for improvement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;