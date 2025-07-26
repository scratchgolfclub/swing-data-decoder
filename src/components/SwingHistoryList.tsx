import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Target, TrendingUp, Eye } from 'lucide-react';

interface SwingData {
  id: string;
  session_name: string;
  club_type: string;
  created_at: string;
  trackman_image_url?: string;
  // Individual metric columns from new swings table
  club_speed?: number;
  ball_speed?: number;
  carry?: number;
  total?: number;
  side?: string;
  face_angle?: number;
  club_path?: number;
  smash_factor?: number;
  spin_rate?: number;
  launch_angle?: number;
  insights?: any[];
}

interface SwingHistoryListProps {
  swingData: SwingData[];
  onDataUpdate: () => void;
}

const SwingHistoryList: React.FC<SwingHistoryListProps> = ({ swingData, onDataUpdate }) => {
  const navigate = useNavigate();

  if (swingData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Swing History</CardTitle>
          <CardDescription>Your analyzed swings will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No swing data yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload your first TrackMan screenshot to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Swing History
        </CardTitle>
        <CardDescription>
          All your analyzed swings ({swingData.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {swingData.map((swing) => (
            <div key={swing.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium">{swing.session_name}</h3>
                  <Badge variant="outline">{swing.club_type}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {swing.total ? `${swing.total} yds` : 'No distance data'}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(swing.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/swing/${swing.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Key Metrics Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {swing.club_speed && (
                  <div>
                    <p className="text-muted-foreground">Club Speed</p>
                    <p className="font-medium">{swing.club_speed} mph</p>
                  </div>
                )}
                {swing.ball_speed && (
                  <div>
                    <p className="text-muted-foreground">Ball Speed</p>
                    <p className="font-medium">{swing.ball_speed} mph</p>
                  </div>
                )}
                {swing.carry && (
                  <div>
                    <p className="text-muted-foreground">Carry</p>
                    <p className="font-medium">{swing.carry} yds</p>
                  </div>
                )}
                {swing.smash_factor && (
                  <div>
                    <p className="text-muted-foreground">Smash Factor</p>
                    <p className="font-medium">{swing.smash_factor}</p>
                  </div>
                )}
              </div>

              {/* Insights Preview */}
              {swing.insights && swing.insights.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>AI Insights:</strong> {swing.insights.length} recommendations available
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SwingHistoryList;