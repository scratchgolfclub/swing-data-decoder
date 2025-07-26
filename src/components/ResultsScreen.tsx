import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target, Home } from "lucide-react";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getStructuredMetrics } from '@/utils/structuredMetricsHelper';
import { MetricTile } from '@/components/MetricTile';

interface ResultsScreenProps {
  data: {
    swings: any[];
    club: string;
  };
  onReset: () => void;
}

export const ResultsScreen = ({ data, onReset }: ResultsScreenProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!data?.swings?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
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
  
  // Get insights from the swing data (these come from the backend now)
  const insights = swing.insights || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onReset} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Analyze Another
          </Button>
          {user && (
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          )}
        </div>

        {/* Results Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Swing Analysis Complete
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Based on your {data.club} TrackMan data
          </p>
        </div>

        {/* AI-Generated Insights Section */}
        {insights.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {insights.map((insight: any) => (
                  <div key={insight.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs ${
                        insight.insight_type === 'strength' ? 'bg-green-100 text-green-800' : 
                        insight.insight_type === 'weakness' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.insight_type}
                      </span>
                      {insight.video_url && (
                        <a 
                          href={insight.video_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
                        >
                          Watch Video →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Swing Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Swing Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {structuredMetrics.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {structuredMetrics.map((metric, index) => (
                  <MetricTile key={index} metric={metric} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                No structured metrics available for this swing.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};