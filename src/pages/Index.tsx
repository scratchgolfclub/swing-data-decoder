import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, Camera, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ResultsScreen } from "@/components/ResultsScreen";
import { extractTrackmanData } from "@/utils/ocrService";
import scratchLogo from "@/assets/scratch-golf-logo.png";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    try {
      const extractedData = await extractTrackmanData(selectedFile);
      setResults(extractedData);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (results) {
    return <ResultsScreen data={results} onReset={() => { setResults(null); setSelectedFile(null); }} />;
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
          {!selectedFile ? (
            <div className="space-y-6">
              {/* Club Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">Select Your Club</h3>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2 max-w-4xl mx-auto">
                  {/* Driver */}
                  <button
                    onClick={() => setSelectedClub('Dr')}
                    className={`w-12 h-12 rounded-full border-2 text-sm font-medium transition-all ${
                      selectedClub === 'Dr' 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-white hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    Dr
                  </button>
                  
                  {/* Woods */}
                  {['2w', '3w', '4w', '5w', '6w', '7w', '8w', '9w'].map((club) => (
                    <button
                      key={club}
                      onClick={() => setSelectedClub(club)}
                      className={`w-12 h-12 rounded-full border-2 text-sm font-medium transition-all ${
                        selectedClub === club 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {club}
                    </button>
                  ))}
                  
                  {/* Hybrids */}
                  {['1h', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h'].map((club) => (
                    <button
                      key={club}
                      onClick={() => setSelectedClub(club)}
                      className={`w-12 h-12 rounded-full border-2 text-sm font-medium transition-all ${
                        selectedClub === club 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {club}
                    </button>
                  ))}
                  
                  {/* Irons */}
                  {['1i', '2i', '3i', '4i', '5i', '6i', '7i', '8i', '9i'].map((club) => (
                    <button
                      key={club}
                      onClick={() => setSelectedClub(club)}
                      className={`w-12 h-12 rounded-full border-2 text-sm font-medium transition-all ${
                        selectedClub === club 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {club}
                    </button>
                  ))}
                  
                  {/* Wedges */}
                  {['Pw', 'Sw', 'Lw'].map((club) => (
                    <button
                      key={club}
                      onClick={() => setSelectedClub(club)}
                      className={`w-12 h-12 rounded-full border-2 text-sm font-medium transition-all ${
                        selectedClub === club 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {club}
                    </button>
                  ))}
                  
                  {/* Degree Wedges */}
                  {['50°', '52°', '54°', '56°', '58°', '60°'].map((club) => (
                    <button
                      key={club}
                      onClick={() => setSelectedClub(club)}
                      className={`w-12 h-12 rounded-full border-2 text-xs font-medium transition-all ${
                        selectedClub === club 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-white hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      {club}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
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
                    onChange={handleFileSelect}
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
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="Selected TrackMan data"
                  className="max-w-full h-auto rounded-lg mx-auto max-h-96 object-contain"
                />
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => setSelectedFile(null)}
                  variant="outline"
                >
                  Choose Different Photo
                </Button>
                <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
                  Analyze Data
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;