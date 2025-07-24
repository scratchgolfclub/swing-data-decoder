import { useEffect, useState } from 'react';

export const LoadingScreen = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 5) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      <div className="text-center">
        <div className="mb-8 relative">
          {/* Golf Club Animation */}
          <div 
            className="w-32 h-32 mx-auto mb-4 transition-transform duration-75 ease-linear"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Club shaft */}
              <line 
                x1="20" y1="80" 
                x2="80" y2="20" 
                stroke="currentColor" 
                strokeWidth="3" 
                className="text-amber-600"
              />
              {/* Club head */}
              <rect 
                x="75" y="15" 
                width="8" height="15" 
                fill="currentColor"
                className="text-gray-600"
                rx="2"
              />
              {/* Grip */}
              <rect 
                x="17" y="77" 
                width="8" height="15" 
                fill="currentColor"
                className="text-black"
                rx="2"
              />
            </svg>
          </div>
          
          {/* Ball trail effect */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-2 h-2 bg-white rounded-full animate-pulse"
                  style={{ 
                    animationDelay: `${i * 0.2}s`,
                    opacity: 1 - (i * 0.2)
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-4 text-green-600">
          Analyzing Your Data
        </h2>
        <p className="text-xl text-muted-foreground mb-4">
          Generating a custom lesson...
        </p>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    </div>
  );
};