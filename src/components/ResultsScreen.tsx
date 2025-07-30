import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, Home, TrendingUp, CheckCircle, AlertTriangle, BookOpen, Play } from "lucide-react";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getStructuredMetrics } from '@/utils/structuredMetricsHelper';
import { MetricTile } from '@/components/MetricTile';
import { InsightCard } from '@/components/InsightCard';

interface ResultsScreenProps {
  data: {
    swings: any[];
    club: string;
  };
  onReset: () => void;
  isDemoMode?: boolean;
}

export const ResultsScreen = ({ data, onReset, isDemoMode = false }: ResultsScreenProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!data?.swings?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-muted p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              No Results Available
            </h1>
            <Button onClick={onReset}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const swing = data.swings[0];
  const structuredMetrics = getStructuredMetrics(swing);
  
  // Get insights from the new recommendation engine
  const insights = swing.insights || [];
  
  // Categorize insights by type for better organization
  const strengths = insights.filter((insight: any) => insight.insight_type === 'strength');
  const weaknesses = insights.filter((insight: any) => insight.insight_type === 'weakness');
  const recommendations = insights.filter((insight: any) => 
    insight.insight_type === 'recommendation' || insight.insight_type === 'drill'
  );

  // Categorize metrics for organized display
  const clubMetrics = structuredMetrics.filter(m => 
    ['Club Speed', 'Attack Angle', 'Club Path', 'Dynamic Loft', 'Face Angle', 'Face to Path', 'Swing Plane'].some(title => 
      m.title.toLowerCase().includes(title.toLowerCase())
    )
  );
  
  const ballMetrics = structuredMetrics.filter(m => 
    ['Ball Speed', 'Smash Factor', 'Launch Angle', 'Launch Direction', 'Spin Rate', 'Spin Axis'].some(title => 
      m.title.toLowerCase().includes(title.toLowerCase())
    )
  );
  
  const flightMetrics = structuredMetrics.filter(m => 
    ['Carry', 'Total', 'Height', 'Curve', 'Hang Time', 'Landing Angle', 'Side'].some(title => 
      m.title.toLowerCase().includes(title.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface-muted">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(158,155,135,0.05),transparent_50%)]"></div>
      
      <div className="relative max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={onReset} 
            variant="outline" 
            className="flex items-center gap-2 hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Analyze Another
          </Button>
          
          <div className="flex items-center gap-3">
            {isDemoMode && (
              <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/20">
                Demo Mode - Sign up to save results
              </Badge>
            )}
            {user && !isDemoMode && (
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-surface-hover transition-colors"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Target className="h-6 w-6 text-accent" />
            <Badge variant="outline" className="text-sm font-medium">
              {data.club} Analysis
            </Badge>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4 leading-tight">
            Swing Analysis
            <span className="block text-accent">Complete</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered insights and recommendations based on your TrackMan data
          </p>
        </div>

        {/* Key Insights Section */}
        {(strengths.length > 0 || weaknesses.length > 0) && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-accent" />
              Key Performance Insights
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {strengths.slice(0, 1).map((insight: any) => (
                <InsightCard
                  key={insight.id}
                  type="strength"
                  title={insight.title}
                  value={`${Math.round(insight.confidence_score * 100)}% confidence`}
                  description={insight.description}
                  icon={CheckCircle}
                />
              ))}
              {weaknesses.slice(0, 1).map((insight: any) => (
                <InsightCard
                  key={insight.id}
                  type="weakness"
                  title={insight.title}
                  value={`${Math.round(insight.confidence_score * 100)}% confidence`}
                  description={insight.description}
                  icon={AlertTriangle}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-accent" />
              Improvement Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((insight: any) => (
                <Card key={insight.id} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-surface border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Target className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">
                          {insight.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {insight.insight_type}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {insight.description}
                    </p>
                    {insight.video_url && (
                      <a 
                        href={insight.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-accent hover:text-accent-hover text-sm font-medium transition-colors"
                      >
                        <Play className="h-3 w-3" />
                        Watch Training Video
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Club Data */}
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                Club Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clubMetrics.length > 0 ? (
                <div className="space-y-3">
                  {clubMetrics.map((metric, index) => (
                    <MetricTile key={index} metric={metric} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No club data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Ball Data */}
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Ball Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ballMetrics.length > 0 ? (
                <div className="space-y-3">
                  {ballMetrics.map((metric, index) => (
                    <MetricTile key={index} metric={metric} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No ball data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Flight Data */}
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                Flight Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {flightMetrics.length > 0 ? (
                <div className="space-y-3">
                  {flightMetrics.map((metric, index) => (
                    <MetricTile key={index} metric={metric} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No flight data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Insights List */}
        {insights.length > 2 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Complete Analysis Report
            </h2>
            <Card className="bg-surface border-border">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {insights.map((insight: any, index: number) => (
                    <div key={insight.id} className="flex gap-4 pb-6 border-b border-border last:border-b-0 last:pb-0">
                      <div className="flex-shrink-0">
                        <Badge 
                          variant={insight.insight_type === 'strength' ? 'default' : 'secondary'}
                          className={`${
                            insight.insight_type === 'strength' ? 'bg-primary/10 text-primary border-primary/20' :
                            insight.insight_type === 'weakness' ? 'bg-warning/10 text-warning border-warning/20' :
                            'bg-accent/10 text-accent border-accent/20'
                          }`}
                        >
                          {insight.insight_type}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2">
                          {insight.title}
                        </h4>
                        <p className="text-muted-foreground mb-3">
                          {insight.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Confidence: {Math.round(insight.confidence_score * 100)}%
                          </span>
                          {insight.video_url && (
                            <a 
                              href={insight.video_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-accent hover:text-accent-hover text-sm transition-colors"
                            >
                              <Play className="h-3 w-3" />
                              Video
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};