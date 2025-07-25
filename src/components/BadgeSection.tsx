import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BadgeDisplay } from './BadgeDisplay';
import { badgeService, BadgeProgress } from '@/utils/badgeService';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Star, Target, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeSectionProps {
  className?: string;
  onBadgeInteraction?: (badgeId: string) => void;
}

export function BadgeSection({ className, onBadgeInteraction }: BadgeSectionProps) {
  const { user } = useAuth();
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      loadBadgeProgress();
    }
  }, [user]);

  const loadBadgeProgress = async () => {
    if (!user) return;
    
    try {
      const progress = await badgeService.getBadgeProgress(user.id);
      setBadgeProgress(progress);
    } catch (error) {
      console.error('Error loading badge progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNewBadgesAsViewed = async () => {
    if (!user) return;
    
    const newBadgeIds = badgeProgress
      .filter(bp => bp.earned && bp.is_new)
      .map(bp => bp.badge.id);
    
    if (newBadgeIds.length > 0) {
      await badgeService.markBadgesAsViewed(user.id, newBadgeIds);
      // Update local state
      setBadgeProgress(prev => 
        prev.map(bp => ({ ...bp, is_new: false }))
      );
    }
  };

  const handleBadgeInteraction = async (badgeId: string) => {
    if (!user) return;
    
    const badge = badgeProgress.find(bp => bp.badge.id === badgeId);
    if (badge?.earned && badge.is_new) {
      await badgeService.markBadgesAsViewed(user.id, [badgeId]);
      // Update local state
      setBadgeProgress(prev => 
        prev.map(bp => 
          bp.badge.id === badgeId 
            ? { ...bp, is_new: false }
            : bp
        )
      );
      
      // Call parent callback if provided
      onBadgeInteraction?.(badgeId);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'upload': return <Target className="h-4 w-4" />;
      case 'score_improvement': return <Trophy className="h-4 w-4" />;
      case 'metric_improvement': return <Star className="h-4 w-4" />;
      case 'multi_metric': return <Users className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredBadges = badgeProgress.filter(bp => 
    selectedCategory === 'all' || bp.badge.badge_type === selectedCategory
  );

  // For collapsed view, show max 8 badges (typical single row)
  const visibleBadges = isExpanded ? filteredBadges : filteredBadges.slice(0, 8);
  const hasMoreBadges = filteredBadges.length > 8;

  const earnedBadges = badgeProgress.filter(bp => bp.earned);
  const newBadges = badgeProgress.filter(bp => bp.earned && bp.is_new);
  const totalBadges = badgeProgress.length;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Loading achievements...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
              {newBadges.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {newBadges.length} New!
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {earnedBadges.length} of {totalBadges} badges earned
            </CardDescription>
          </div>
          
          {newBadges.length > 0 && (
            <Button variant="outline" size="sm" onClick={markNewBadgesAsViewed}>
              Mark as Viewed
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-1">
              {getCategoryIcon('upload')}
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="score_improvement" className="flex items-center gap-1">
              {getCategoryIcon('score_improvement')}
              <span className="hidden sm:inline">Score</span>
            </TabsTrigger>
            <TabsTrigger value="metric_improvement" className="flex items-center gap-1">
              {getCategoryIcon('metric_improvement')}
              <span className="hidden sm:inline">Metrics</span>
            </TabsTrigger>
            <TabsTrigger value="multi_metric" className="flex items-center gap-1">
              {getCategoryIcon('multi_metric')}
              <span className="hidden sm:inline">Multi</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedCategory} className="mt-4">
            {filteredBadges.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No badges in this category yet.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Always visible badges */}
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                  {visibleBadges.map((badgeProgress) => (
                    <BadgeDisplay
                      key={badgeProgress.badge.id}
                      badgeProgress={badgeProgress}
                      size="md"
                      showProgress={!badgeProgress.earned}
                      className="flex flex-col items-center"
                      onInteraction={() => handleBadgeInteraction(badgeProgress.badge.id)}
                    />
                  ))}
                </div>
                
                {/* Collapsible section for remaining badges */}
                {hasMoreBadges && (
                  <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full flex items-center gap-2"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Show {filteredBadges.length - 8} More Badges
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-4">
                      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                        {filteredBadges.slice(8).map((badgeProgress) => (
                          <BadgeDisplay
                            key={badgeProgress.badge.id}
                            badgeProgress={badgeProgress}
                            size="md"
                            showProgress={!badgeProgress.earned}
                            className="flex flex-col items-center"
                            onInteraction={() => handleBadgeInteraction(badgeProgress.badge.id)}
                          />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}