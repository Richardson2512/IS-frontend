import { supabase } from '../lib/supabase';

export interface SearchHistoryEntry {
  id?: string;
  user_id?: string;
  search_query: string;
  platforms: string[];
  language: string;
  time_filter: string;
  user_tier: 'free' | 'standard' | 'pro';
  total_results: number;
  pain_points_count: number;
  trending_ideas_count: number;
  content_ideas_count: number;
  user_email?: string;
  is_authenticated: boolean;
  search_duration_ms?: number;
  platforms_succeeded?: string[];
  platforms_failed?: string[];
  created_at?: string;
}

export interface SearchAnalytics {
  search_date: string;
  search_query: string;
  search_count: number;
  unique_users: number;
  avg_results: number;
  avg_duration_ms: number;
  user_tier: string;
  platforms: string[];
}

export class SearchHistoryService {
  /**
   * Track a search in the database
   */
  static async trackSearch(entry: SearchHistoryEntry): Promise<{ success: boolean; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .insert([{
          user_id: entry.user_id || null,
          search_query: entry.search_query,
          platforms: entry.platforms,
          language: entry.language,
          time_filter: entry.time_filter,
          user_tier: entry.user_tier,
          total_results: entry.total_results,
          pain_points_count: entry.pain_points_count,
          trending_ideas_count: entry.trending_ideas_count,
          content_ideas_count: entry.content_ideas_count,
          user_email: entry.user_email,
          is_authenticated: entry.is_authenticated,
          search_duration_ms: entry.search_duration_ms,
          platforms_succeeded: entry.platforms_succeeded,
          platforms_failed: entry.platforms_failed
        }]);

      if (error) {
        console.error('❌ Error tracking search history:', error);
        return { success: false, error };
      }

      console.log('✅ Search history tracked successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Exception tracking search history:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user's search history
   */
  static async getUserSearchHistory(userId: string, limit: number = 50): Promise<SearchHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching search history:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('❌ Exception fetching search history:', error);
      return [];
    }
  }

  /**
   * Get popular searches (for analytics)
   */
  static async getPopularSearches(limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('search_query, user_tier, created_at')
        .order('created_at', { ascending: false })
        .limit(1000); // Get last 1000 searches

      if (error) {
        console.error('❌ Error fetching popular searches:', error);
        return [];
      }

      // Aggregate by search query
      const searchCounts = (data || []).reduce((acc: any, item: any) => {
        const key = item.search_query.toLowerCase().trim();
        if (!acc[key]) {
          acc[key] = {
            query: item.search_query,
            count: 0,
            free_count: 0,
            standard_count: 0,
            pro_count: 0
          };
        }
        acc[key].count++;
        if (item.user_tier === 'free') acc[key].free_count++;
        if (item.user_tier === 'standard') acc[key].standard_count++;
        if (item.user_tier === 'pro') acc[key].pro_count++;
        return acc;
      }, {});

      // Convert to array and sort by count
      return Object.values(searchCounts)
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, limit);

    } catch (error) {
      console.error('❌ Exception fetching popular searches:', error);
      return [];
    }
  }

  /**
   * Get search analytics
   */
  static async getSearchAnalytics(days: number = 7): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching search analytics:', error);
        return null;
      }

      const searches = data || [];

      return {
        total_searches: searches.length,
        unique_users: new Set(searches.map(s => s.user_id).filter(Boolean)).size,
        authenticated_searches: searches.filter(s => s.is_authenticated).length,
        anonymous_searches: searches.filter(s => !s.is_authenticated).length,
        avg_results: searches.reduce((sum, s) => sum + (s.total_results || 0), 0) / searches.length || 0,
        avg_duration_ms: searches.reduce((sum, s) => sum + (s.search_duration_ms || 0), 0) / searches.length || 0,
        by_tier: {
          free: searches.filter(s => s.user_tier === 'free').length,
          standard: searches.filter(s => s.user_tier === 'standard').length,
          pro: searches.filter(s => s.user_tier === 'pro').length
        },
        by_platform: this.aggregateByPlatform(searches),
        by_time_filter: this.aggregateByTimeFilter(searches),
        daily_counts: this.aggregateByDay(searches)
      };

    } catch (error) {
      console.error('❌ Exception fetching search analytics:', error);
      return null;
    }
  }

  /**
   * Helper: Aggregate searches by platform
   */
  private static aggregateByPlatform(searches: any[]): any {
    const platformCounts: any = {};
    searches.forEach(search => {
      (search.platforms || []).forEach((platform: string) => {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      });
    });
    return platformCounts;
  }

  /**
   * Helper: Aggregate searches by time filter
   */
  private static aggregateByTimeFilter(searches: any[]): any {
    const timeFilterCounts: any = {};
    searches.forEach(search => {
      const filter = search.time_filter || 'unknown';
      timeFilterCounts[filter] = (timeFilterCounts[filter] || 0) + 1;
    });
    return timeFilterCounts;
  }

  /**
   * Helper: Aggregate searches by day
   */
  private static aggregateByDay(searches: any[]): any[] {
    const dailyCounts: any = {};
    searches.forEach(search => {
      const date = new Date(search.created_at).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Delete old search history (for privacy/cleanup)
   */
  static async cleanupOldSearches(daysToKeep: number = 90): Promise<{ success: boolean; deleted: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { data, error } = await supabase
        .from('search_history')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) {
        console.error('❌ Error cleaning up search history:', error);
        return { success: false, deleted: 0 };
      }

      console.log(`✅ Cleaned up search history older than ${daysToKeep} days`);
      return { success: true, deleted: (data as any)?.length || 0 };

    } catch (error) {
      console.error('❌ Exception cleaning up search history:', error);
      return { success: false, deleted: 0 };
    }
  }
}

