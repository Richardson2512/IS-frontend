import React, { useState } from 'react';
import { Sparkles, Search, MonitorPlay } from 'lucide-react';
import { EnhancedResearchDashboard } from './EnhancedResearchDashboard';
import ResearchDashboard from './ResearchDashboard';
import { AdSearchDashboard } from './AdSearch/AdSearchDashboard';

import { Footer } from './Footer';

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

  const commonProps = {
    onHome,
    onContact,
    onBlog,
    onLogin,
    onSignUp,
    onSignOut,
    onPrivacyPolicy,
    onTermsAndConditions,
    onPricing,
    user,
    searchCount
  };

  if (viewMode === 'ads') {
    return (
      <AdSearchDashboard 
        onBack={() => setViewMode('standard')} 
        userTier={user?.subscription_tier}
        {...commonProps}
      />
    );
  }

  if (viewMode === 'enhanced') {
    return (
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
        onBack={() => setViewMode('standard')}
        {...commonProps}
      />
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
