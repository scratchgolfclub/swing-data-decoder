import { useEffect, useState } from 'react';
import { Target, Brain, Zap, TrendingUp, Star, Award } from 'lucide-react';

const loadingPhrases = [
  { text: "Scanning your TrackMan data...", icon: Target, duration: 2000 },
  { text: "Calling Scottie Scheffler for consultation...", icon: Brain, duration: 3000 },
  { text: "Analyzing swing mechanics...", icon: Zap, duration: 2500 },
  { text: "Building your personalized lesson plan...", icon: TrendingUp, duration: 2800 },
  { text: "Adding some PGA Tour magic...", icon: Star, duration: 2200 },
  { text: "Finalizing your path to improvement...", icon: Award, duration: 2000 },
];

export const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    // Progress animation that smoothly fills to 100% and then pulses
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Create a pulsing effect when at 100%
          setShowPulse(true);
          return 100;
        }
        return prev + 1.2;
      });
    }, 60);

    // Cycle through loading phrases
    const phraseInterval = setInterval(() => {
      setCurrentPhrase(prev => (prev + 1) % loadingPhrases.length);
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(phraseInterval);
    };
  }, []);

  const currentPhraseData = loadingPhrases[currentPhrase];
  const IconComponent = currentPhraseData.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-stone-50 to-stone-100 dark:from-emerald-950 dark:via-stone-950 dark:to-stone-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Golf Balls */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-300/20 to-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-primary/20 to-emerald-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
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

        {/* Dynamic Icon with Smooth Transitions */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full animate-ping" />
            <div className="relative p-4 bg-gradient-to-r from-primary to-emerald-500 rounded-full text-white shadow-2xl">
              <IconComponent 
                className="h-8 w-8 animate-bounce" 
                style={{ animationDuration: '2s' }}
              />
            </div>
          </div>
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

        {/* Dynamic Loading Text with Smooth Transitions */}
        <div className="h-20 flex items-center justify-center">
          <div className="animate-fade-in" key={currentPhrase}>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-transparent bg-gradient-to-r from-primary via-emerald-600 to-primary bg-clip-text">
              {currentPhraseData.text}
            </h2>
            <div className="flex justify-center space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
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