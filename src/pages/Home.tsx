import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Target, TrendingUp } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
          {/* Logo */}
          <div className="mb-4">
            <img 
              src="/lovable-uploads/6b2a3a0f-ee63-46a5-893e-8fdb1833e4f1.png" 
              alt="Scratch Golf Club Logo" 
              className="h-28 w-auto mx-auto"
            />
          </div>

          {/* Hero Section */}
          <div className="max-w-3xl space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent leading-tight">
              Elevate Your Golf Game
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed">
              Transform your TrackMan data into actionable insights
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Upload your swing data and get AI-powered analysis with personalized recommendations, 
              progress tracking, and expert guidance to take your game to the next level.
            </p>
          </div>

          {/* Action Buttons Container */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-2 max-w-lg w-full">
            <CardContent className="p-0 space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Get Started Today</h3>
                <p className="text-sm text-muted-foreground">Choose your path to better golf</p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/auth?mode=signin')}
                  className="w-full h-12 text-base font-medium group"
                  size="lg"
                >
                  Sign In to Your Account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                
                <Button 
                  onClick={() => navigate('/auth?mode=signup')}
                  variant="outline"
                  className="w-full h-12 text-base font-medium group hover:bg-primary hover:text-primary-foreground"
                  size="lg"
                >
                  Create New Account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/demo')}
                  variant="secondary"
                  className="w-full h-12 text-base font-medium group bg-muted/50 hover:bg-muted"
                  size="lg"
                >
                  Try Demo (No Account)
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-5xl">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  AI-Powered Analysis
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Advanced machine learning algorithms analyze your TrackMan data to provide 
                  detailed insights and identify improvement opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  Progress Tracking
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor your improvement journey with detailed progress reports, 
                  trend analysis, and achievement badges to keep you motivated.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  Expert Recommendations
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get personalized practice drills, mental game tips, and video tutorials 
                  tailored to your specific swing characteristics and goals.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 max-w-2xl">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Game?</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Join thousands of golfers who have improved their swing with our AI-powered analysis. 
              Start your journey to better golf today.
            </p>
            <Button 
              onClick={() => navigate('/auth?mode=signup')}
              size="lg"
              className="h-12 px-8 text-base font-medium"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;