import { useEffect, useState } from 'react';
import { Target, Brain, Zap, TrendingUp, Star, Award } from 'lucide-react';

const loadingPhrases = [
  { text: "Scanning your TrackMan data...", icon: Target, duration: 3500 },
  { text: "Calling Scottie Scheffler for consultation...", icon: Brain, duration: 4000 },
  { text: "Analyzing swing mechanics...", icon: Zap, duration: 3800 },
  { text: "Building your personalized lesson plan...", icon: TrendingUp, duration: 4200 },
  { text: "Adding some PGA Tour magic...", icon: Star, duration: 3600 },
  { text: "Finalizing your path to improvement...", icon: Award, duration: 3500 },
];

export const LoadingScreen = ({ onComplete }: { onComplete?: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [showPulse, setShowPulse] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Progress animation that stops at 95% until ready
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          // Stop at 95% and wait for external completion signal
          return prev;
        }
        return prev + 1.5;
      });
    }, 80);

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  // Typewriter effect for each phrase
  useEffect(() => {
    const currentPhraseData = loadingPhrases[currentPhrase];
    const text = currentPhraseData.text;
    let timeoutId: NodeJS.Timeout;
    
    setIsTyping(true);
    setDisplayedText('');
    
    // Type out the text character by character
    const typeText = (index: number) => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        timeoutId = setTimeout(() => typeText(index + 1), 50); // 50ms per character
      } else {
        setIsTyping(false);
        // Wait for the specified duration before moving to next phrase
        timeoutId = setTimeout(() => {
          setCurrentPhrase(prev => (prev + 1) % loadingPhrases.length);
        }, currentPhraseData.duration - (text.length * 50)); // Subtract typing time
      }
    };

    typeText(0);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentPhrase]);

  // External completion handler to finish progress
  const completeLoading = () => {
    setProgress(100);
    setTimeout(() => {
      onComplete?.();
    }, 800);
  };

  // Make completeLoading available globally for testing
  useEffect(() => {
    (window as any).completeLoading = completeLoading;
    return () => {
      delete (window as any).completeLoading;
    };
  }, [onComplete]);

  const currentPhraseData = loadingPhrases[currentPhrase];
  const IconComponent = currentPhraseData.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-stone-50 to-stone-100 dark:from-emerald-950 dark:via-stone-950 dark:to-stone-900 relative overflow-hidden">
      {/* Simplified Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Elegant gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-300/10 to-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-primary/10 to-emerald-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/5 to-primary/5 rounded-full blur-2xl animate-pulse transform -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '4s' }} />
      </div>

      <div className="text-center max-w-lg mx-auto p-8 z-10 relative">
        {/* Logo with Glow Effect */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
          <img 
            src="/lovable-uploads/8ca06ed2-bd76-4910-ad83-6e8259bf704b.png" 
            alt="SGC Logo" 
            className="h-20 w-auto mx-auto relative z-10 drop-shadow-2xl animate-scale-in"
          />
        </div>

        {/* Progress Ring with Multiple Layers */}
        <div className="mb-8 relative">
          <div className="w-48 h-48 mx-auto relative">
            {/* Outer Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-stone-200 dark:text-stone-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#progressGradient)"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className={`transition-all duration-300 ease-out ${showPulse && progress >= 100 ? 'animate-pulse' : ''}`}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(16 185 129)" />
                  <stop offset="50%" stopColor="rgb(5 150 105)" />
                  <stop offset="100%" stopColor="rgb(4 120 87)" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent ${progress >= 100 ? 'animate-pulse' : ''}`}>
                  {Math.round(progress)}%
                </div>
                {progress >= 100 && (
                  <div className="text-xs text-muted-foreground mt-1 animate-fade-in">
                    Almost ready...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Loading Text with Typewriter Effect */}
        <div className="h-24 flex items-center justify-center">
          <div className="animate-fade-in text-center" key={currentPhrase}>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-transparent bg-gradient-to-r from-primary via-emerald-600 to-primary bg-clip-text">
              {displayedText}
              {isTyping && (
                <span className="animate-pulse text-primary">|</span>
              )}
            </h2>
            <div className="flex justify-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-gradient-to-r from-primary to-emerald-500 rounded-full animate-bounce"
                  style={{ 
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '1.2s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Subtle Motivational Text */}
        <p className="text-muted-foreground animate-fade-in mt-4" style={{ animationDelay: '0.5s' }}>
          Crafting your personalized path to lower scores
        </p>
      </div>

    </div>
  );
};