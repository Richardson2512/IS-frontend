import React, { useState } from 'react';
import { Sparkles, Search, MonitorPlay } from 'lucide-react';
import { EnhancedResearchDashboard } from './EnhancedResearchDashboard';
import ResearchDashboard from './ResearchDashboard';
import { AdSearchDashboard } from './AdSearch/AdSearchDashboard';

interface User {
  id: string;
  name: string;
  email: string;
  subscription_tier: 'free' | 'standard' | 'pro';
  search_count: number;
}

interface MultiStepSearchToggleProps {
  onHome: () => void;
  onContact: () => void;
  onBlog: () => void;
  onLogin: () => void;
  onSignUp: () => void;
  onShowResults: (results: any, query: string) => void;
  onSearchLimitReached: () => void;
  onSearchPerformed: () => void;
  onSignOut: () => void;
  onPrivacyPolicy: () => void;
  onTermsAndConditions: () => void;
  onPricing: () => void;
  user: User | null;
  searchCount: number;
}

type ViewMode = 'standard' | 'enhanced' | 'ads';

export const MultiStepSearchToggle: React.FC<MultiStepSearchToggleProps> = ({
  onHome,
  onContact,
  onBlog,
  onLogin,
  onSignUp,
  onShowResults,
  onSearchLimitReached,
  onSearchPerformed,
  onSignOut,
  onPrivacyPolicy,
  onTermsAndConditions,
  onPricing,
  user,
  searchCount
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('standard');

  if (viewMode === 'ads') {
    return (
      <AdSearchDashboard 
        onBack={() => setViewMode('standard')} 
        userTier={user?.subscription_tier} 
      />
    );
  }

  if (viewMode === 'enhanced') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Search Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode('standard')}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back to Standard Search
                </button>
                <div className="h-6 w-px bg-gray-300" />
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Enhanced AI Search</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={onHome}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={onContact}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Contact
                </button>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{user?.email}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {user?.subscription_tier}
                  </span>
                  <button
                    onClick={onSignOut}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <EnhancedResearchDashboard 
          userTier={user?.subscription_tier || 'free'}
          onSearchComplete={(results) => {
            console.log('Enhanced search completed:', results);
            // Convert to the format expected by onShowResults
            const formattedResults = {
              painPoints: results.results?.painPoints || results.results || [],
              trendingIdeas: results.results?.trendingIdeas || [],
              contentIdeas: results.results?.contentIdeas || []
            };
            onShowResults(formattedResults, results.metadata?.expandedQuery || '');
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Mode Selection Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 py-3">
            <button
              onClick={() => setViewMode('standard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'standard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="font-medium">Content Search</span>
            </button>
            <button
              onClick={() => setViewMode('ads')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'ads' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MonitorPlay className="w-4 h-4" />
              <span className="font-medium">Ad Intelligence</span>
            </button>
            <button
              onClick={() => setViewMode('enhanced')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'enhanced' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Enhanced AI Search</span>
            </button>
          </div>
        </div>
      </div>

      <ResearchDashboard
        onHome={onHome}
        onContact={onContact}
        onBlog={onBlog}
        onLogin={onLogin}
        onSignUp={onSignUp}
        onShowResults={onShowResults}
        onSearchLimitReached={onSearchLimitReached}
        onSearchPerformed={onSearchPerformed}
        onSignOut={onSignOut}
        onPrivacyPolicy={onPrivacyPolicy}
        onTermsAndConditions={onTermsAndConditions}
        onPricing={onPricing}
        user={user}
        searchCount={searchCount}
      />
    </div>
  );
};
