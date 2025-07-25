
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Target, TrendingUp, X } from 'lucide-react';

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
  const renderMetricCard = (label: string, value: string | number, unit?: string) => {
    if (!value) return null;
    
    const displayValue = typeof value === 'string' ? value : `${value}${unit || ''}`;
    
    return (
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-lg font-semibold">{displayValue}</p>
      </div>
    );
  };

  const metrics = swingData.initial_metrics || {};

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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {renderMetricCard('Club Speed', metrics.clubSpeed)}
                {renderMetricCard('Attack Angle', metrics.attackAngle)}
                {renderMetricCard('Club Path', metrics.clubPath)}
                {renderMetricCard('Dynamic Loft', metrics.dynLoft)}
                {renderMetricCard('Face Angle', metrics.faceAngle)}
                {renderMetricCard('Face to Path', metrics.faceToPath)}
                {renderMetricCard('Swing Plane', metrics.swingPlane)}
                {renderMetricCard('Swing Direction', metrics.swingDirection)}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {renderMetricCard('Ball Speed', metrics.ballSpeed)}
                {renderMetricCard('Smash Factor', metrics.smashFactor)}
                {renderMetricCard('Launch Angle', metrics.launchAngle)}
                {renderMetricCard('Launch Direction', metrics.launchDirection)}
                {renderMetricCard('Spin Rate', metrics.spinRate)}
                {renderMetricCard('Spin Axis', metrics.spinAxis)}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {renderMetricCard('Carry Distance', metrics.carry)}
                {renderMetricCard('Total Distance', metrics.total)}
                {renderMetricCard('Height', metrics.height)}
                {renderMetricCard('Curve', metrics.curve)}
                {renderMetricCard('Hang Time', metrics.hangTime)}
                {renderMetricCard('Landing Angle', metrics.landingAngle)}
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
