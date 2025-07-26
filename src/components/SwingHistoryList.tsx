
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Target, TrendingUp, Eye } from 'lucide-react';
import SwingDetailModal from './SwingDetailModal';
import { getStructuredMetrics, findMetricByTitle } from '@/utils/structuredMetricsHelper';

interface SwingData {
  id: string;
  session_name: string;
  club_type: string;
  initial_metrics: any;
  swing_score: number;
  is_baseline: boolean;
  created_at: string;
  coaching_notes: string;
  trackman_image_url?: string;
}

interface SwingHistoryListProps {
  swingData: SwingData[];
  onDataUpdate: () => void;
}

const SwingHistoryList: React.FC<SwingHistoryListProps> = ({ swingData, onDataUpdate }) => {
  const navigate = useNavigate();
  const [selectedSwing, setSelectedSwing] = useState<SwingData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewDetails = (swing: SwingData) => {
    setSelectedSwing(swing);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedSwing(null);
  };

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
    <>
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
                    {swing.is_baseline && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Baseline
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">Score: {swing.swing_score}/100</p>
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
                {swing.initial_metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {(() => {
                      const structuredMetrics = getStructuredMetrics(swing.initial_metrics);
                      const keyMetrics = ['Club Speed', 'Ball Speed', 'Carry Distance', 'Smash Factor'];
                      
                      return keyMetrics.map(metricTitle => {
                        const metric = findMetricByTitle(structuredMetrics, metricTitle);
                        if (!metric) return null;
                        
                        return (
                          <div key={metricTitle}>
                            <p className="text-muted-foreground">{metric.title}</p>
                            <p className="font-medium">{metric.value}</p>
                          </div>
                        );
                      }).filter(Boolean);
                    })()}
                  </div>
                )}

                {/* Coaching Notes */}
                {swing.coaching_notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Notes:</strong> {swing.coaching_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedSwing && (
        <SwingDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseModal}
          swingData={selectedSwing}
        />
      )}
    </>
  );
};

export default SwingHistoryList;
