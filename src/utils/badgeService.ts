import { supabase } from '@/integrations/supabase/client';
import { getStructuredMetrics, getMetricValue } from './structuredMetricsHelper';

export interface Badge {
  id: string;
  name: string;
  description: string;
  badge_type: string;
  criteria: any;
  icon_emoji: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  is_new: boolean;
  badge: Badge;
}

export interface BadgeProgress {
  badge: Badge;
  earned: boolean;
  progress: number;
  total: number;
  is_new?: boolean;
}

export const badgeService = {
  // Get all available badges
  async getAllBadges(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('created_at');
    
    if (error) throw error;
    return data || [];
  },

  // Get user's earned badges
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badges(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Check and award new badges for a user
  async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
    const newBadges: UserBadge[] = [];
    
    // Get all badges and user's current badges
    const [allBadges, userBadges, swingData] = await Promise.all([
      this.getAllBadges(),
      this.getUserBadges(userId),
      this.getUserSwingData(userId)
    ]);

    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      const earned = await this.checkBadgeCriteria(badge, swingData, userId);
      if (earned) {
        const newBadge = await this.awardBadge(userId, badge.id);
        if (newBadge) newBadges.push(newBadge);
      }
    }

    return newBadges;
  },

  // Award a specific badge to a user
  async awardBadge(userId: string, badgeId: string): Promise<UserBadge | null> {
    const { data, error } = await supabase
      .from('user_badges')
      .insert({ user_id: userId, badge_id: badgeId })
      .select(`
        *,
        badge:badges(*)
      `)
      .single();
    
    if (error) {
      console.error('Error awarding badge:', error);
      return null;
    }
    
    return data;
  },

  // Mark badges as viewed (no longer new)
  async markBadgesAsViewed(userId: string, badgeIds: string[]) {
    const { error } = await supabase
      .from('user_badges')
      .update({ is_new: false })
      .eq('user_id', userId)
      .in('badge_id', badgeIds);
    
    if (error) console.error('Error marking badges as viewed:', error);
  },

  // Get badge progress for all badges
  async getBadgeProgress(userId: string): Promise<BadgeProgress[]> {
    const [allBadges, userBadges, swingData] = await Promise.all([
      this.getAllBadges(),
      this.getUserBadges(userId),
      this.getUserSwingData(userId)
    ]);

    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
    const newBadgeIds = new Set(userBadges.filter(ub => ub.is_new).map(ub => ub.badge_id));

    return allBadges.map(badge => {
      const earned = earnedBadgeIds.has(badge.id);
      const progress = earned ? 1 : this.calculateProgress(badge, swingData);
      
      return {
        badge,
        earned,
        progress: Math.min(progress.current, progress.total),
        total: progress.total,
        is_new: newBadgeIds.has(badge.id)
      };
    });
  },

  // Helper: Get user's swing data for badge calculations
  async getUserSwingData(userId: string) {
    const { data, error } = await supabase
      .from('swing_data')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');
    
    if (error) throw error;
    return data || [];
  },

  // Helper: Check if badge criteria is met
  async checkBadgeCriteria(badge: Badge, swingData: any[], userId: string): Promise<boolean> {
    const criteria = badge.criteria;

    switch (badge.badge_type) {
      case 'upload':
        return swingData.length >= criteria.swing_count;
      
      case 'score_improvement':
        return this.checkScoreImprovement(swingData, criteria.score_improvement);
      
      case 'metric_improvement':
        return this.checkMetricImprovement(swingData, criteria.improvement_percentage);
      
      case 'multi_metric':
        return this.checkMultiMetricImprovement(swingData, criteria.metrics_improved);
      
      default:
        return false;
    }
  },

  // Helper: Calculate progress towards a badge
  calculateProgress(badge: Badge, swingData: any[]): { current: number; total: number } {
    const criteria = badge.criteria;

    switch (badge.badge_type) {
      case 'upload':
        return { current: swingData.length, total: criteria.swing_count };
      
      case 'score_improvement':
        const scoreImprovement = this.getMaxScoreImprovement(swingData);
        return { current: scoreImprovement, total: criteria.score_improvement };
      
      case 'metric_improvement':
        const maxImprovement = this.getMaxMetricImprovement(swingData);
        return { current: maxImprovement, total: criteria.improvement_percentage };
      
      case 'multi_metric':
        const improvedMetrics = this.getImprovedMetricsCount(swingData);
        return { current: improvedMetrics, total: criteria.metrics_improved };
      
      default:
        return { current: 0, total: 1 };
    }
  },

  // Badge criteria helpers
  checkScoreImprovement(swingData: any[], requiredImprovement: number): boolean {
    if (swingData.length < 2) return false;
    
    const scores = swingData.map(s => s.swing_score || 0).filter(s => s > 0);
    if (scores.length < 2) return false;
    
    const firstScore = scores[0];
    const bestScore = Math.max(...scores);
    
    return (bestScore - firstScore) >= requiredImprovement;
  },

  getMaxScoreImprovement(swingData: any[]): number {
    if (swingData.length < 2) return 0;
    
    const scores = swingData.map(s => s.swing_score || 0).filter(s => s > 0);
    if (scores.length < 2) return 0;
    
    const firstScore = scores[0];
    const bestScore = Math.max(...scores);
    
    return Math.max(0, bestScore - firstScore);
  },

  checkMetricImprovement(swingData: any[], requiredPercentage: number): boolean {
    return this.getMaxMetricImprovement(swingData) >= requiredPercentage;
  },

  getMaxMetricImprovement(swingData: any[]): number {
    if (swingData.length < 2) return 0;
    
    const baseline = swingData.find(s => s.is_baseline);
    if (!baseline) return 0;
    
    const baselineStructured = getStructuredMetrics(baseline.structured_baseline_metrics);
    let maxImprovement = 0;
    
    swingData.forEach(swing => {
      const swingStructured = getStructuredMetrics(swing.structured_metrics);
      
      baselineStructured.forEach(baseMetric => {
        const baseValue = getMetricValue([baseMetric], baseMetric.title);
        const currentValue = getMetricValue(swingStructured, baseMetric.title);
        
        if (baseValue !== null && currentValue !== null && baseValue !== 0) {
          const improvement = Math.abs((currentValue - baseValue) / baseValue) * 100;
          maxImprovement = Math.max(maxImprovement, improvement);
        }
      });
    });
    
    return maxImprovement;
  },

  checkMultiMetricImprovement(swingData: any[], requiredCount: number): boolean {
    return this.getImprovedMetricsCount(swingData) >= requiredCount;
  },

  getImprovedMetricsCount(swingData: any[]): number {
    if (swingData.length < 2) return 0;
    
    const baseline = swingData.find(s => s.is_baseline);
    if (!baseline) return 0;
    
    const baselineStructured = getStructuredMetrics(baseline.structured_baseline_metrics);
    const improvedMetrics = new Set<string>();
    
    swingData.forEach(swing => {
      const swingStructured = getStructuredMetrics(swing.structured_metrics);
      
      baselineStructured.forEach(baseMetric => {
        const baseValue = getMetricValue([baseMetric], baseMetric.title);
        const currentValue = getMetricValue(swingStructured, baseMetric.title);
        
        if (baseValue !== null && currentValue !== null && baseValue !== 0) {
          const improvement = Math.abs((currentValue - baseValue) / baseValue) * 100;
          if (improvement >= 10) { // 10% improvement threshold
            improvedMetrics.add(baseMetric.title);
          }
        }
      });
    });
    
    return improvedMetrics.size;
  }
};