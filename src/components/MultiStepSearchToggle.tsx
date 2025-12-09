import React, { useState } from 'react';
import { Sparkles, Search } from 'lucide-react';
import { EnhancedResearchDashboard } from './EnhancedResearchDashboard';
import ResearchDashboard from './ResearchDashboard';

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
  const [useEnhancedSearch, setUseEnhancedSearch] = useState(false);

  if (useEnhancedSearch) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Search Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setUseEnhancedSearch(false)}
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
              painPoints: results.results || [],
              trendingIdeas: [],
              contentIdeas: []
            };
            onShowResults(formattedResults, results.metadata?.expandedQuery || '');
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Original Research Dashboard - Now with Enhanced Search integrated */}
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
