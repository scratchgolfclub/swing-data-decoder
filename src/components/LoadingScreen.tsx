import { useEffect, useState } from 'react';
import scratchLogo from "@/assets/scratch-golf-logo.png";

export const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 80);

    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900">
      <div className="text-center max-w-md mx-auto p-8">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/lovable-uploads/8ca06ed2-bd76-4910-ad83-6e8259bf704b.png" 
            alt="SGC Logo" 
            className="h-16 w-auto mx-auto mb-8 opacity-90"
          />
        </div>

        {/* Elegant Progress Animation */}
        <div className="mb-8">
          <div className="w-80 h-1 bg-stone-200 dark:bg-stone-700 rounded-full mx-auto overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 text-2xl font-light text-primary">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Text */}
        <h2 className="text-3xl font-bold mb-4 text-primary">
          Analyzing Your Data{dots}
        </h2>
        <p className="text-lg text-muted-foreground">
          Generating your personalized lesson recommendations
        </p>
      </div>
    </div>
  );
};