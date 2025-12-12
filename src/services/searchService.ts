import { SearchParams, AnalyzedResults, getBackendApiUrl, AdPlatform } from './apiConfig';

export interface SearchOptions {
  userTier?: 'free' | 'standard' | 'pro';
  userId?: string;
}

export interface SearchResponse {
  results: AnalyzedResults;
  metadata?: {
    noResultsMessage?: {
      title: string;
      message: string;
      reasons: string[];
      suggestions: string[];
      tip: string;
    };
    [key: string]: any;
  };
}

export interface AdSearchResponse {
  ads: any[];
  metadata?: any;
}

export interface QueryExpansionResponse {
  success: boolean;
  data: {
    originalQuery: string;
    subtopics: Subtopic[];
  };
}

export interface Subtopic {
  title: string;
  description: string;
  expandedQuery: string;
  category: string;
  isCustom?: boolean;
}

export interface FocusedSearchResponse {
  success: boolean;
  data: {
    results: any[];
    metadata: {
      totalPosts: number;
      relevantPosts: number;
      category: string;
      expandedQuery: string;
      originalQuery: string;
      platforms: string[];
      duration: number;
      relevanceScore: number;
    };
  };
}

export class SearchService {
  private static readonly API_BASE_URL = (() => {
    const url = import.meta.env.VITE_BACKEND_URL;
    if (!url) {
      throw new Error('VITE_BACKEND_URL environment variable is not set. Please configure it in your .env file.');
    }
    return url;
  })();

  static async performSearch(params: SearchParams, options?: SearchOptions): Promise<SearchResponse> {
    try {
      console.log('🔍 Starting search with params:', params);
      console.log('🎯 User tier:', options?.userTier || 'free');
      console.log('🌐 Backend URL:', this.API_BASE_URL);
      
      const apiUrl = getBackendApiUrl(this.API_BASE_URL);
      const response = await fetch(`${apiUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: params.query,
          platforms: params.platforms,
          language: params.language,
          timeFilter: params.timeFilter,
          userTier: options?.userTier || 'free'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Search API error:', errorData);
        
        // Handle specific error cases
        if (response.status === 429) {
          throw new Error('⚠️ Too many searches. Please wait a few minutes and try again.');
        } else if (response.status === 503) {
          throw new Error('⚠️ Service temporarily unavailable due to high traffic. Please try again in a minute.');
        } else if (response.status >= 500) {
          throw new Error('⚠️ Server error. Our team has been notified. Please try again shortly.');
        }
        
        throw new Error(errorData.message || `Search failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        console.error('❌ Search failed:', result.message);
        throw new Error(result.message || 'Search failed');
      }

      console.log('🎉 Search complete!');
      console.log(`📊 Results: ${result.data.painPoints.length} pain points, ${result.data.trendingIdeas.length} trending ideas, ${result.data.contentIdeas.length} content ideas`);
      console.log('⏱️ Duration:', result.metadata.duration + 'ms');
      
      if (result.metadata.errors && result.metadata.errors.length > 0) {
        console.warn('⚠️ Some platforms failed:', result.metadata.errors);
      }

      // Check for intelligent no-results message
      if (result.metadata.noResultsMessage) {
        console.log('📝 No results message:', result.metadata.noResultsMessage.title);
      }

      console.log('✅ Analysis complete:', {
        painPoints: result.data.painPoints.length,
        trendingIdeas: result.data.trendingIdeas.length,
        contentIdeas: result.data.contentIdeas.length,
        tier: options?.userTier || 'free'
      });

      // Return both results and metadata including noResultsMessage
      return {
        results: result.data,
        metadata: result.metadata
      };

    } catch (error) {
      console.error('❌ Search error:', error);
      
      // Re-throw error with user-friendly message
      throw error;
    }
  }

  // New method: Perform ad search
  static async performAdSearch(query: string, platforms: AdPlatform[], options?: SearchOptions): Promise<AdSearchResponse> {
    try {
      console.log('🔍 Starting ad search for:', query);
      console.log('🎯 Platforms:', platforms);
      
      const apiUrl = getBackendApiUrl(this.API_BASE_URL);
      const response = await fetch(`${apiUrl}/search/ads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          platforms,
          userTier: options?.userTier || 'free'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Ad search failed: ${response.status}`);
      }

      const result = await response.json();
      return result.data;

    } catch (error) {
      console.error('❌ Ad search error:', error);
      throw error;
    }
  }

  static async testApiConnections(): Promise<{reddit: boolean, x: boolean, backend: boolean}> {
    const results = {
      reddit: false,
      x: false,
      backend: false
    };

    console.log('🧪 Testing API connections...');

    try {
      // Test backend health
      console.log('🔍 Testing backend connection...');
      const apiUrl = getBackendApiUrl(this.API_BASE_URL);
      const healthResponse = await fetch(`${apiUrl}/search/health`);
      if (healthResponse.ok) {
        console.log('✅ Backend connection: OK');
        results.backend = true;
      }
    } catch (error) {
      console.error('❌ Backend connection test failed:', error);
    }

    // Note: Reddit and X endpoints removed - now using ScrapeCreators API via backend
    // These tests are no longer needed as platforms are accessed through /api/search
    results.reddit = true; // Assumed available via ScrapeCreators
    results.x = true; // Assumed available via ScrapeCreators

    console.log('📊 API Test Results:', results);
    return results;
  }

  /**
   * Get tier limits for UI display
   */
  static getTierLimits(userTier: string) {
    // Results are per platform within each category
    const tierLimits = {
      free: { perPlatform: 1, totalPerCategory: 3, isFree: true }, // Free users get 3 total results combined
      standard: { perPlatform: 3, totalPerCategory: 9 }, // Standard: 3 per platform × 3 platforms = 9 per category
      pro: { perPlatform: 5, totalPerCategory: 15 } // Pro: 5 per platform × 3 platforms = 15 per category
    };
    
    const limits = tierLimits[userTier as keyof typeof tierLimits] || tierLimits.free;
    
    return {
      maxSearches: userTier === 'free' ? 5 : userTier === 'standard' ? 50 : 999999,
      resultsPerCategory: limits.totalPerCategory,
      perPlatform: limits.perPlatform,
      tierLimits: limits
    };
  }

  // New method: Generate query expansion options
  static async generateQueryExpansion(query: string): Promise<QueryExpansionResponse> {
    try {
      console.log('🔍 Generating query expansion for:', query);
      console.log('🌐 Backend URL:', this.API_BASE_URL);
      console.log('🔗 Full URL:', `${this.API_BASE_URL}/search/expand-query`);
      console.log('📤 Request payload:', { query });
      
      const apiUrl = getBackendApiUrl(this.API_BASE_URL);
      const response = await fetch(`${apiUrl}/search/expand-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.message || `Query expansion failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Query expansion generated:', result.data.subtopics.length, 'subtopics');
      console.log('📥 Response data:', result);
      
      return result;

    } catch (error) {
      console.error('❌ Query expansion error:', error);
      throw error;
    }
  }

  // New method: Perform focused search with specific subtopic and category
  static async performFocusedSearch(
    originalQuery: string,
    expandedQuery: string,
    selectedCategory: 'pain-points' | 'trending-ideas' | 'content-ideas',
    options?: {
      platforms?: string[];
      timeFilter?: string;
      language?: string;
    }
  ): Promise<FocusedSearchResponse> {
    try {
      console.log('🎯 Performing focused search:', {
        originalQuery,
        expandedQuery,
        selectedCategory,
        options
      });
      console.log('🌐 Backend URL:', this.API_BASE_URL);
      console.log('🔗 Full URL:', `${this.API_BASE_URL}/search/focused-search`);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout

      try {
        const apiUrl = getBackendApiUrl(this.API_BASE_URL);
        const response = await fetch(`${apiUrl}/search/focused-search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            originalQuery,
            expandedQuery,
            selectedCategory,
            platforms: options?.platforms || ['reddit', 'x', 'youtube', 'linkedin', 'threads'],
            timeFilter: options?.timeFilter || 'week',
            language: options?.language || 'en'
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.message || `Focused search failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Focused search complete:', {
        results: result.data.results.length,
        relevance: result.data.metadata.relevanceScore,
        category: result.data.metadata.category
      });
      
        return result;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // Handle timeout
        if (fetchError.name === 'AbortError') {
          console.error('❌ Focused search timed out after 2 minutes');
          throw new Error('Request timed out. The analysis is taking longer than expected. Please try again with a simpler query.');
        }
        
        // Handle network errors
        if (fetchError.message.includes('fetch')) {
          console.error('❌ Network error during focused search:', fetchError);
          throw new Error('Network error. Please check your connection and try again.');
        }
        
        throw fetchError;
      }
    } catch (error: any) {
      console.error('❌ Focused search error:', error);
      
      // Provide user-friendly error messages
      if (error.message) {
        throw error;
      }
      
      throw new Error(error.message || 'Failed to analyze posts. Please try again.');
    }
  }
}
