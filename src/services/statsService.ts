import { supabase } from '../lib/supabase';

export interface PlatformStats {
  totalSearches: number; // Lifetime total searches
  totalAuthUsers: number; // Total authenticated users from auth.users
  registeredUsers: number; // Users who have ever performed a search
  searchesToday: number; // Searches performed today
  topKeywords: { keyword: string; count: number }[];
}

export class StatsService {
  /**
   * Get real-time platform statistics
   */
  static async getPlatformStats(): Promise<PlatformStats> {
    try {
      // Preferred: use RPC that returns global stats (bypasses RLS safely)
      try {
        const { data: statsData, error: statsError } = await supabase.rpc('get_platform_stats');
        if (!statsError && statsData) {
          return {
            totalSearches: statsData.totalSearches || 0,
            totalAuthUsers: statsData.totalAuthUsers || 0,
            registeredUsers: statsData.totalAuthUsers || 0, // best-effort; real registered users not provided by RPC
            searchesToday: statsData.searchesToday || 0,
            topKeywords: Array.isArray(statsData.topKeywords) ? statsData.topKeywords : []
          };
        }
      } catch {
        // ignore and fall back
      }

      // Get total searches count
      const { count: totalSearches } = await supabase
        .from('search_history')
        .select('*', { count: 'exact', head: true });

      // Get total authenticated users
      // Priority: 1) Database function, 2) user_profiles table, 3) search_history fallback
      let totalAuthUsers = 0;
      
      try {
        // Try using the database function first (most accurate)
        const { data: functionData, error: functionError } = await supabase
          .rpc('get_total_auth_users_count');
        
        if (!functionError && functionData !== null) {
          totalAuthUsers = functionData;
          console.log('✅ Got auth users from database function:', totalAuthUsers);
        } else {
          throw new Error('Function not available');
        }
      } catch (functionError) {
        // Try user_profiles table
        try {
          const { count: authUsersCount } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true });
          
          if (authUsersCount !== null) {
            totalAuthUsers = authUsersCount;
            console.log('✅ Got auth users from user_profiles:', totalAuthUsers);
          } else {
            throw new Error('user_profiles not available');
          }
        } catch (profileError) {
          // Fallback: count unique users from search_history
          console.log('⚠️ Using search_history for user count fallback');
          const { data: allUsersData } = await supabase
            .from('search_history')
            .select('user_id')
            .not('user_id', 'is', null);
          const uniqueAllUsers = new Set(allUsersData?.map(item => item.user_id) || []);
          totalAuthUsers = uniqueAllUsers.size;
          console.log('✅ Got auth users from search_history fallback:', totalAuthUsers);
        }
      }

      // Get registered users count (users who have searched at least once)
      const { data: registeredUsersData } = await supabase
        .from('search_history')
        .select('user_id')
        .not('user_id', 'is', null);
      
      // Count unique users
      const uniqueUsers = new Set(registeredUsersData?.map(item => item.user_id) || []);

      // Get searches from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: searchesToday } = await supabase
        .from('search_history')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get top 5 keywords (most searched)
      const { data: searchHistoryData } = await supabase
        .from('search_history')
        .select('search_query')
        .order('created_at', { ascending: false })
        .limit(100); // Get last 100 searches

      // Count keyword frequencies
      const keywordCounts: { [key: string]: number } = {};
      searchHistoryData?.forEach((search) => {
        const query = search.search_query.toLowerCase().trim();
        keywordCounts[query] = (keywordCounts[query] || 0) + 1;
      });

      // Sort and get top 5
      const topKeywords = Object.entries(keywordCounts)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalSearches: totalSearches || 0,
        totalAuthUsers: totalAuthUsers || 0,
        registeredUsers: uniqueUsers.size || 0,
        searchesToday: searchesToday || 0,
        topKeywords
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      // Return default values on error
      return {
        totalSearches: 0,
        totalAuthUsers: 0,
        registeredUsers: 0,
        searchesToday: 0,
        topKeywords: []
      };
    }
  }

  /**
   * Subscribe to real-time stats updates
   */
  static subscribeToStatsUpdates(callback: (stats: PlatformStats) => void) {
    // Initial fetch
    this.getPlatformStats().then(callback);

    // Subscribe to search_history changes
    const channel = supabase
      .channel('stats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'search_history'
        },
        () => {
          // Fetch updated stats when search_history changes
          this.getPlatformStats().then(callback);
        }
      )
      .subscribe();

    // Fallback: refresh periodically in case realtime is blocked by RLS/replication settings
    const intervalId = setInterval(() => {
      this.getPlatformStats().then(callback);
    }, 30000);

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }
}

