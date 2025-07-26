
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Target, TrendingUp, X } from 'lucide-react';
import { getStructuredMetrics, StructuredMetric } from '@/utils/structuredMetricsHelper';

interface SwingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  swingData: {
    id: string;
    session_name: string;
    club_type: string;
    initial_metrics: any;
    swing_score: number;
    is_baseline: boolean;
    created_at: string;
    coaching_notes: string;
    trackman_image_url?: string;
  };
}

const SwingDetailModal: React.FC<SwingDetailModalProps> = ({ isOpen, onClose, swingData }) => {
  const renderMetricCard = (metric: StructuredMetric) => {
    return (
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
        <p className="text-lg font-semibold">{metric.value}</p>
        <p className="text-xs text-muted-foreground mt-1">{metric.descriptor}</p>
      </div>
    );
  };

  const structuredMetrics = getStructuredMetrics(swingData.initial_metrics);
  
  // Categorize metrics for better organization
  const clubMetrics = structuredMetrics.filter(m => 
    ['Club Speed', 'Attack Angle', 'Club Path', 'Dynamic Loft', 'Face Angle', 'Face to Path', 'Swing Plane', 'Swing Direction'].some(title => 
      m.title.toLowerCase().includes(title.toLowerCase())
    )
  );
  
  const ballMetrics = structuredMetrics.filter(m => 
    ['Ball Speed', 'Smash Factor', 'Launch Angle', 'Launch Direction', 'Spin Rate', 'Spin Axis'].some(title => 
      m.title.toLowerCase().includes(title.toLowerCase())
    )
  );
  
  const flightMetrics = structuredMetrics.filter(m => 
    ['Carry Distance', 'Total Distance', 'Height', 'Curve', 'Hang Time', 'Landing Angle', 'Side'].some(title => 
      m.title.toLowerCase().includes(title.toLowerCase())
    )
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Target className="h-5 w-5" />
            {swingData.session_name}
            <Badge variant="outline">{swingData.club_type}</Badge>
            {swingData.is_baseline && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Baseline
              </Badge>
            )}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {new Date(swingData.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Score: {swingData.swing_score}/100
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* TrackMan Image */}
          {swingData.trackman_image_url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">TrackMan Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src={swingData.trackman_image_url} 
                  alt="TrackMan analysis"
                  className="w-full max-w-2xl mx-auto rounded-lg border"
                />
              </CardContent>
            </Card>
          )}

          {/* Club Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Club Data</CardTitle>
              <CardDescription>Measurements from your club during impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {clubMetrics.map((metric, index) => (
                  <div key={index}>
                    {renderMetricCard(metric)}
                  </div>
                ))}
                {clubMetrics.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-4">No club data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ball Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ball Data</CardTitle>
              <CardDescription>Ball flight characteristics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ballMetrics.map((metric, index) => (
                  <div key={index}>
                    {renderMetricCard(metric)}
                  </div>
                ))}
                {ballMetrics.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-4">No ball data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Flight Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Flight Data</CardTitle>
              <CardDescription>Ball flight results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {flightMetrics.map((metric, index) => (
                  <div key={index}>
                    {renderMetricCard(metric)}
                  </div>
                ))}
                {flightMetrics.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-4">No flight data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Coaching Notes */}
          {swingData.coaching_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Coaching Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{swingData.coaching_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SwingDetailModal;
