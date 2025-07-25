import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import scratchLogo from "@/assets/scratch-golf-logo-main.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src={scratchLogo} 
              alt="Scratch Golf Logo" 
              className="h-32 w-auto mx-auto"
            />
          </div>

          {/* Description */}
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Analyze Your Golf Swing
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Upload your TrackMan data and get AI-powered analysis of your golf swing. 
              Discover your strengths, identify areas for improvement, and receive personalized 
              recommendations to take your game to the next level.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto"
              size="lg"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              variant="outline"
              className="w-full sm:w-auto"
              size="lg"
            >
              Create Account
            </Button>
            <Button 
              onClick={() => navigate('/demo')}
              variant="secondary"
              className="w-full sm:w-auto"
              size="lg"
            >
              Try it without account
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl">
            <div className="text-center p-6 rounded-lg bg-card border">
              <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Get detailed insights from your TrackMan data using advanced AI technology
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border">
              <h3 className="font-semibold mb-2">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your improvement over time with personalized dashboards
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border">
              <h3 className="font-semibold mb-2">Expert Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Receive targeted drills and tips to improve your swing mechanics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;