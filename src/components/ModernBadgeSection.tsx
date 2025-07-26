import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, Trophy, Target, Zap, Award, Star, Crown } from 'lucide-react';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { badgeService, BadgeProgress } from '@/utils/badgeService';

interface ModernBadgeSectionProps {
  className?: string;
  onBadgeInteraction?: (badgeId: string) => void;
}

export const ModernBadgeSection = ({ className, onBadgeInteraction }: ModernBadgeSectionProps) => {
  const { user } = useAuth();
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      loadBadgeProgress();
    }
  }, [user]);

  const loadBadgeProgress = async () => {
    if (!user?.id) return;
    
    try {
      const progress = await badgeService.getBadgeProgress(user.id);
      setBadgeProgress(progress || []);
    } catch (error) {
      console.error('Error loading badge progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBadgeInteraction = (badgeId: string) => {
    onBadgeInteraction?.(badgeId);
  };

  // Show only first 6 badges in collapsed state
  const visibleBadges = isExpanded ? badgeProgress : badgeProgress.slice(0, 6);
  const hasMoreBadges = badgeProgress.length > 6;

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-surface to-surface-elevated border-border/60 shadow-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Trophy className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Achievements</CardTitle>
              <CardDescription className="text-sm">Your golf improvement milestones</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-16 h-16 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card className="bg-gradient-to-br from-surface to-surface-elevated border-border/60 shadow-card hover:shadow-elegant transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                <Trophy className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Achievements</CardTitle>
                <CardDescription className="text-sm">Your golf improvement milestones</CardDescription>
              </div>
            </div>
            
            <Badge variant="secondary" className="font-medium">
              {badgeProgress.filter(b => b.earned).length}/{badgeProgress.length}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <div className="space-y-4">
              {/* Always visible badges */}
              <div className="flex flex-wrap gap-3">
                {visibleBadges.map((badgeProgress, index) => (
                  <BadgeDisplay
                    key={badgeProgress.badge.id}
                    badgeProgress={badgeProgress}
                    onInteraction={() => handleBadgeInteraction(badgeProgress.badge.id)}
                    className="transition-transform duration-200 hover:scale-110"
                  />
                ))}
              </div>
              
              {/* Collapsible content for additional badges */}
              {hasMoreBadges && (
                <CollapsibleContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {badgeProgress.slice(6).map((badgeProgress, index) => (
                      <BadgeDisplay
                        key={badgeProgress.badge.id}
                        badgeProgress={badgeProgress}
                        onInteraction={() => handleBadgeInteraction(badgeProgress.badge.id)}
                        className="transition-transform duration-200 hover:scale-110"
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              )}
              
              {/* Toggle button */}
              {hasMoreBadges && (
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-3 text-muted-foreground hover:text-foreground"
                  >
                    {isExpanded ? (
                      <>Show less <ChevronDown className="ml-2 h-4 w-4 rotate-180" /></>
                    ) : (
                      <>Show {badgeProgress.length - 6} more <ChevronDown className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};