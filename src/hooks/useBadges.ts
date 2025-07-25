import { useState, useEffect, useCallback } from 'react';
import { badgeService, UserBadge, BadgeProgress } from '@/utils/badgeService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useBadges() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [newBadges, setNewBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial badge progress
  const loadBadgeProgress = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const progress = await badgeService.getBadgeProgress(user.id);
      setBadgeProgress(progress);
    } catch (error) {
      console.error('Error loading badge progress:', error);
      toast({
        title: "Error",
        description: "Failed to load badge progress.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Check for new badges after user activity
  const checkForNewBadges = useCallback(async () => {
    if (!user) return;
    
    try {
      const earnedBadges = await badgeService.checkAndAwardBadges(user.id);
      
      if (earnedBadges.length > 0) {
        setNewBadges(prev => [...prev, ...earnedBadges]);
        
        // Update badge progress to reflect new badges
        await loadBadgeProgress();
        
        // Show toast for first badge only to avoid spam
        if (earnedBadges.length === 1) {
          toast({
            title: "🎉 Badge Earned!",
            description: `You earned the "${earnedBadges[0].badge.name}" badge!`,
          });
        } else {
          toast({
            title: "🎉 Multiple Badges Earned!",
            description: `You earned ${earnedBadges.length} new badges!`,
          });
        }
      }
    } catch (error) {
      console.error('Error checking for new badges:', error);
    }
  }, [user, toast, loadBadgeProgress]);

  // Mark badges as viewed
  const markBadgesAsViewed = useCallback(async (badgeIds: string[]) => {
    if (!user || badgeIds.length === 0) return;
    
    try {
      await badgeService.markBadgesAsViewed(user.id, badgeIds);
      
      // Update local state
      setBadgeProgress(prev => 
        prev.map(bp => 
          badgeIds.includes(bp.badge.id) 
            ? { ...bp, is_new: false }
            : bp
        )
      );
    } catch (error) {
      console.error('Error marking badges as viewed:', error);
    }
  }, [user]);

  // Dismiss notification and mark as viewed
  const dismissBadgeNotification = useCallback(async (badgeId: string) => {
    setNewBadges(prev => prev.filter(b => b.badge_id !== badgeId));
    await markBadgesAsViewed([badgeId]);
  }, [markBadgesAsViewed]);

  // Load initial data
  useEffect(() => {
    loadBadgeProgress();
  }, [loadBadgeProgress]);

  // Get statistics
  const stats = {
    total: badgeProgress.length,
    earned: badgeProgress.filter(bp => bp.earned).length,
    newCount: badgeProgress.filter(bp => bp.earned && bp.is_new).length,
    recentBadges: badgeProgress
      .filter(bp => bp.earned)
      .slice(0, 5) // Most recent 5 badges
  };

  return {
    badgeProgress,
    newBadges,
    loading,
    stats,
    checkForNewBadges,
    markBadgesAsViewed,
    dismissBadgeNotification,
    refreshBadges: loadBadgeProgress
  };
}