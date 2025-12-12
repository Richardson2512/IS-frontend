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

  const renderDashboard = () => {
    if (viewMode === 'ads') {
      return (
        <AdSearchDashboard 
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
            const formattedResults = {
              painPoints: results.results?.painPoints || results.results || [],
              trendingIdeas: results.results?.trendingIdeas || [],
              contentIdeas: results.results?.contentIdeas || []
            };
            onShowResults(formattedResults, results.metadata?.expandedQuery || '');
          }}
          {...commonProps}
        />
      );
    }

    return (
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
    );
  };

  const userTier = user?.subscription_tier || 'free';
  const canAccessAdIntelligence = userTier === 'standard' || userTier === 'pro';
  const canAccessEnhancedAI = userTier === 'pro';

  // Reset to accessible view if current view is not accessible
  useEffect(() => {
    if (viewMode === 'ads' && !canAccessAdIntelligence) {
      setViewMode('standard');
    } else if (viewMode === 'enhanced' && !canAccessEnhancedAI) {
      setViewMode('standard');
    }
  }, [viewMode, canAccessAdIntelligence, canAccessEnhancedAI]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b sticky top-0 z-20">
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
              disabled={!canAccessAdIntelligence}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                !canAccessAdIntelligence 
                  ? 'opacity-50 cursor-not-allowed text-gray-400' 
                  : viewMode === 'ads' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50'
              }`}
              title={!canAccessAdIntelligence ? 'Upgrade to Standard or Pro to access Ad Intelligence' : ''}
            >
              <MonitorPlay className="w-4 h-4" />
              <span className="font-medium">Ad Intelligence</span>
              {!canAccessAdIntelligence && (
                <span className="ml-1 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Pro</span>
              )}
            </button>
            <button
              onClick={() => setViewMode('enhanced')}
              disabled={!canAccessEnhancedAI}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                !canAccessEnhancedAI 
                  ? 'opacity-50 cursor-not-allowed text-gray-400' 
                  : viewMode === 'enhanced' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50'
              }`}
              title={!canAccessEnhancedAI ? 'Upgrade to Pro to access Enhanced AI Search' : ''}
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Enhanced AI Search</span>
              {!canAccessEnhancedAI && (
                <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Pro</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow">
        {renderDashboard()}
      </div>
    </div>
  );
};
