import React, { useState, useEffect } from 'react';
import { StatsService, PlatformStats } from '../services/statsService';

export const PlatformStatsBar: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalSearches: 0,
    totalAuthUsers: 0,
    registeredUsers: 0,
    searchesToday: 0,
    topKeywords: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial load
    loadStats();

    // Subscribe to real-time updates
    const unsubscribe = StatsService.subscribeToStatsUpdates((newStats) => {
      setStats(newStats);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    const newStats = await StatsService.getPlatformStats();
    setStats(newStats);
    setIsLoading(false);
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      {/* Product Context */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI-Powered Social Media Insights
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Discover what your audience really wants by analyzing real conversations from Reddit, X (Twitter), YouTube, TikTok, Instagram, Threads, Pinterest, and Google. 
          Get instant insights into pain points, trending ideas, and content opportunities.
        </p>
      </div>

      {/* Simple Stats */}
      <div className="flex items-center justify-center gap-8 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            {isLoading ? '...' : formatNumber(stats.totalSearches)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Keywords Searched</div>
        </div>
        
        <div className="h-12 w-px bg-gray-200"></div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {isLoading ? '...' : formatNumber(stats.totalAuthUsers)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total Users</div>
        </div>
        
        <div className="h-12 w-px bg-gray-200"></div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            {isLoading ? '...' : formatNumber(stats.searchesToday)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Searches Today</div>
        </div>
      </div>
    </div>
  );
};

