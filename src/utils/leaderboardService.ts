import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  user_id: string;
  first_name: string;
  last_name: string;
  longest_drive: number | null;
  accuracy_average: number | null;
  total_swings: number;
  rank: number;
}

export interface LeaderboardStats {
  longest_drive_rank: number | null;
  accuracy_rank: number | null;
  improvement_rank: number | null;
  total_users: number;
}

// Calculate leaderboard from swing_data table for now
export const getLeaderboard = async (type: 'longest_drive' | 'accuracy' | 'improvement', limit: number = 50): Promise<LeaderboardEntry[]> => {
  try {
    // Get all users with their swing data and profiles
    const { data: swingData, error } = await supabase
      .from('swing_data')
      .select(`
        user_id,
        initial_metrics,
        swing_data_non_baseline
      `);

    if (error) {
      console.error('Error fetching swing data:', error);
      return [];
    }

    // Calculate stats per user
    const userStats = new Map<string, {
      user_id: string;
      first_name: string;
      last_name: string;
      longest_drive: number;
      total_side: number;
      swing_count: number;
    }>();

    // Get all profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name');

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    swingData?.forEach(swing => {
      const userId = swing.user_id;
      const profile = profileMap.get(userId);
      
      if (!profile) return; // Skip if no profile found
      
      if (!userStats.has(userId)) {
        const fullName = (profile as any).name || 'Unknown Player';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || 'Unknown';
        const lastName = nameParts.slice(1).join(' ') || 'Player';
        
        userStats.set(userId, {
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          longest_drive: 0,
          total_side: 0,
          swing_count: 0
        });
      }

      const stats = userStats.get(userId)!;
      stats.swing_count++;

      // Check initial_metrics
      if (swing.initial_metrics && typeof swing.initial_metrics === 'object') {
        const metrics = swing.initial_metrics as any;
        if (metrics.total && typeof metrics.total === 'number') {
          stats.longest_drive = Math.max(stats.longest_drive, Math.abs(metrics.total));
        }
        if (metrics.side && typeof metrics.side === 'number') {
          stats.total_side += Math.abs(metrics.side);
        }
      }

      // Check swing_data_non_baseline
      if (swing.swing_data_non_baseline && typeof swing.swing_data_non_baseline === 'object') {
        const metrics = swing.swing_data_non_baseline as any;
        if (metrics.total && typeof metrics.total === 'number') {
          stats.longest_drive = Math.max(stats.longest_drive, Math.abs(metrics.total));
        }
        if (metrics.side && typeof metrics.side === 'number') {
          stats.total_side += Math.abs(metrics.side);
        }
      }
    });

    // Convert to array and sort
    const entries: LeaderboardEntry[] = Array.from(userStats.values()).map(stats => ({
      user_id: stats.user_id,
      first_name: stats.first_name,
      last_name: stats.last_name,
      longest_drive: stats.longest_drive > 0 ? stats.longest_drive : null,
      accuracy_average: stats.swing_count > 0 ? stats.total_side / stats.swing_count : null,
      total_swings: stats.swing_count,
      rank: 0
    }));

    // Sort based on type
    switch (type) {
      case 'longest_drive':
        entries.sort((a, b) => (b.longest_drive || 0) - (a.longest_drive || 0));
        break;
      case 'accuracy':
        entries.sort((a, b) => {
          if (a.accuracy_average === null) return 1;
          if (b.accuracy_average === null) return -1;
          return a.accuracy_average - b.accuracy_average; // Lower is better for accuracy
        });
        break;
      case 'improvement':
        entries.sort((a, b) => b.total_swings - a.total_swings); // Fallback to total swings
        break;
    }

    // Add ranks and limit
    return entries.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  } catch (error) {
    console.error('Error calculating leaderboard:', error);
    return [];
  }
};

export const getUserLeaderboardStats = async (userId: string): Promise<LeaderboardStats> => {
  try {
    // Get all leaderboards to find user's rank
    const [longestDrive, accuracy] = await Promise.all([
      getLeaderboard('longest_drive', 1000),
      getLeaderboard('accuracy', 1000)
    ]);

    const longestDriveRank = longestDrive.findIndex(entry => entry.user_id === userId) + 1;
    const accuracyRank = accuracy.findIndex(entry => entry.user_id === userId) + 1;

    // Get total unique users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    return {
      longest_drive_rank: longestDriveRank > 0 ? longestDriveRank : null,
      accuracy_rank: accuracyRank > 0 ? accuracyRank : null,
      improvement_rank: null,
      total_users: totalUsers || 0
    };
  } catch (error) {
    console.error('Error getting user leaderboard stats:', error);
    return {
      longest_drive_rank: null,
      accuracy_rank: null,
      improvement_rank: null,
      total_users: 0
    };
  }
};

export const refreshUserStats = async (userId: string): Promise<void> => {
  try {
    // For now, this is just a placeholder since we're calculating on the fly
    console.log('Stats refreshed for user:', userId);
  } catch (error) {
    console.error('Error refreshing user stats:', error);
  }
};