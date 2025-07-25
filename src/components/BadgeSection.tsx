import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeDisplay } from './BadgeDisplay';
import { badgeService, BadgeProgress } from '@/utils/badgeService';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Star, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeSectionProps {
  className?: string;
}

export function BadgeSection({ className }: BadgeSectionProps) {
  const { user } = useAuth();
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
          <div className="text-center py-8 text-muted-foreground">
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
          
          <TabsContent value={selectedCategory} className="mt-6">
            {filteredBadges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No badges in this category yet.
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
                {filteredBadges.map((badgeProgress) => (
                  <BadgeDisplay
                    key={badgeProgress.badge.id}
                    badgeProgress={badgeProgress}
                    size="md"
                    showProgress={!badgeProgress.earned}
                    className="flex flex-col items-center"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}