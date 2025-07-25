import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardUser {
  user_id: string;
  first_name: string;
  last_name: string;
  longest_drive: number;
  accuracy_average: number;
  improvement_score: number;
  total_swings: number;
  rank: number;
}

export interface LeaderboardData {
  longestDrive: LeaderboardUser[];
  mostAccurate: LeaderboardUser[];
  mostImprovement: LeaderboardUser[];
}

export const leaderboardService = {
  async getLeaderboardData(): Promise<LeaderboardData> {
    try {
      // Get longest drive leaderboard
      const { data: longestDriveData, error: driveError } = await supabase
        .from('user_stats')
        .select(`
          user_id,
          longest_drive,
          accuracy_average,
          improvement_score,
          total_swings,
          profiles!inner(first_name, last_name)
        `)
        .gt('longest_drive', 0)
        .order('longest_drive', { ascending: false })
        .limit(10);

      if (driveError) throw driveError;

      // Get most accurate leaderboard
      const { data: accuracyData, error: accuracyError } = await supabase
        .from('user_stats')
        .select(`
          user_id,
          longest_drive,
          accuracy_average,
          improvement_score,
          total_swings,
          profiles!inner(first_name, last_name)
        `)
        .gt('total_swings', 0)
        .order('accuracy_average', { ascending: true })
        .limit(10);

      if (accuracyError) throw accuracyError;

      // Get most improvement leaderboard
      const { data: improvementData, error: improvementError } = await supabase
        .from('user_stats')
        .select(`
          user_id,
          longest_drive,
          accuracy_average,
          improvement_score,
          total_swings,
          profiles!inner(first_name, last_name)
        `)
        .gt('improvement_score', 0)
        .order('improvement_score', { ascending: false })
        .limit(10);

      if (improvementError) throw improvementError;

      // Format data and add rankings
      const formatLeaderboard = (data: any[]): LeaderboardUser[] => {
        return data.map((item, index) => ({
          user_id: item.user_id,
          first_name: item.profiles.first_name,
          last_name: item.profiles.last_name,
          longest_drive: item.longest_drive,
          accuracy_average: item.accuracy_average,
          improvement_score: item.improvement_score,
          total_swings: item.total_swings,
          rank: index + 1
        }));
      };

      return {
        longestDrive: formatLeaderboard(longestDriveData || []),
        mostAccurate: formatLeaderboard(accuracyData || []),
        mostImprovement: formatLeaderboard(improvementData || [])
      };
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      return {
        longestDrive: [],
        mostAccurate: [],
        mostImprovement: []
      };
    }
  },

  async getUserRankings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Get user's rank in each category
      const [driveRank, accuracyRank, improvementRank] = await Promise.all([
        this.getUserRankInCategory('longest_drive', data.longest_drive, false),
        this.getUserRankInCategory('accuracy_average', data.accuracy_average, true),
        this.getUserRankInCategory('improvement_score', data.improvement_score, false)
      ]);

      return {
        stats: data,
        rankings: {
          longestDrive: driveRank,
          mostAccurate: accuracyRank,
          mostImprovement: improvementRank
        }
      };
    } catch (error) {
      console.error('Error fetching user rankings:', error);
      return null;
    }
  },

  async getUserRankInCategory(column: string, value: number, ascending: boolean): Promise<number> {
    try {
      const operator = ascending ? 'lt' : 'gt';
      const { count } = await supabase
        .from('user_stats')
        .select('*', { count: 'exact', head: true })
        .filter(column, operator, value);

      return (count || 0) + 1;
    } catch (error) {
      console.error(`Error getting rank for ${column}:`, error);
      return 0;
    }
  },

  async updateUserStats(userId: string) {
    try {
      const { error } = await supabase.rpc('update_user_stats', {
        user_uuid: userId
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating user stats:', error);
      return { success: false, error };
    }
  }
};