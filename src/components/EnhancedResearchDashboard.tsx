import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowLeft, Sparkles, TrendingUp as Trending, MessageSquare, Lightbulb } from 'lucide-react';
import { SearchService, Subtopic } from '../services/searchService';
import { QueryExpansionModal } from './QueryExpansionModal';
import { CategorySelectionModal } from './CategorySelectionModal';
import ResultsPage from './ResultsPage';
import { PlatformStatsBar } from './PlatformStatsBar';
import { SearchHistoryService } from '../services/searchHistoryService';

interface EnhancedResearchDashboardProps {
  onSearchComplete?: (results: any) => void;
  user: any;
  onHome: () => void;
  onContact: () => void;
  onSignOut: () => void;
  onBlog: () => void;
  onPrivacyPolicy: () => void;
  onTermsAndConditions: () => void;
  onLogin: () => void;
  onSignUp: () => void;
  searchCount?: number;
}

export const EnhancedResearchDashboard: React.FC<EnhancedResearchDashboardProps> = ({
  onSearchComplete,
  user,
  onHome,
  onContact,
  onSignOut,
  onBlog,
  onPrivacyPolicy,
  onTermsAndConditions,
  onLogin,
  onSignUp
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Multi-step search state
  const [currentStep, setCurrentStep] = useState<'search' | 'expansion' | 'category' | 'results'>('search');
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchMetadata, setSearchMetadata] = useState<any>(null);
  const [popularKeywords, setPopularKeywords] = useState<Array<{ query: string; count: number }>>([]);
  const [popularKeywordsPeriod, setPopularKeywordsPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [loadingPopularKeywords, setLoadingPopularKeywords] = useState(false);

  const handleInitialSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Starting multi-step search for:', searchQuery);
      
      // Step 1: Generate query expansion options
      const expansionResponse = await SearchService.generateQueryExpansion(searchQuery.trim());
      
      if (expansionResponse.success && expansionResponse.data.subtopics.length > 0) {
        setSubtopics(expansionResponse.data.subtopics);
        setCurrentStep('expansion');
        console.log('✅ Query expansion generated, showing subtopic selection');
      } else {
        throw new Error('Failed to generate query expansion options');
      }
    } catch (err) {
      console.error('❌ Query expansion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate search options');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubtopicSelection = (subtopic: Subtopic) => {
    console.log('📝 User selected subtopic:', subtopic.title);
    setSelectedSubtopic(subtopic);
    setCurrentStep('category');
  };

  const handleCustomQuery = async (customQuery: string) => {
    console.log('📝 User entered custom query:', customQuery);
    const customSubtopic: Subtopic = {
      title: 'Custom Topic',
      description: `Your custom search: ${customQuery}`,
      expandedQuery: customQuery,
      category: 'custom',
      isCustom: true
    };
    setSelectedSubtopic(customSubtopic);
    setCurrentStep('category');
  };

  const handleCategorySelection = async (category: 'pain-points' | 'trending-ideas' | 'content-ideas') => {
    if (!selectedSubtopic) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🎯 Performing focused search:', {
        subtopic: selectedSubtopic.title,
        category,
        expandedQuery: selectedSubtopic.expandedQuery
      });

      // Step 3: Perform focused search
      const searchResponse = await SearchService.performFocusedSearch(
        searchQuery,
        selectedSubtopic.expandedQuery,
        category,
        {
          platforms: ['reddit', 'x', 'youtube', 'linkedin', 'threads'],
          timeFilter: 'week',
          language: 'en'
        }
      );

      if (searchResponse.success) {
        // Normalize backend posts into the AnalyzedResults shape expected by ResultsPage
        const normalized = (searchResponse.data.results || []).map((post: any, idx: number) => ({
          id: post.id || post._id || `post-${idx}`,
          content: post.content || post.text || post.title || '',
          platform: post.platform || 'reddit',
          source: post.source || post.url || '',
          engagement: post.engagement || 0,
          timestamp: post.timestamp || post.created_at || new Date().toISOString(),
          url: post.url
        }));

        const formattedResults = {
          painPoints: normalized,
          trendingIdeas: [],
          contentIdeas: []
        };

        setSearchResults(formattedResults);
        setSearchMetadata(searchResponse.data.metadata);
        setCurrentStep('results');
        console.log('✅ Focused search complete:', {
          results: formattedResults.painPoints.length,
          relevance: searchResponse.data.metadata.relevanceScore
        });
        
        // Call the callback if provided
        if (onSearchComplete) {
          onSearchComplete({
            results: formattedResults,
            metadata: searchResponse.data.metadata
          });
        }
      } else {
        throw new Error('Focused search failed');
      }
    } catch (err) {
      console.error('❌ Focused search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setCurrentStep('search');
    setSubtopics([]);
    setSelectedSubtopic(null);
    setSearchResults(null);
    setSearchMetadata(null);
    setError(null);
  };

  useEffect(() => {
    const fetchPopularKeywords = async () => {
      setLoadingPopularKeywords(true);
      try {
        const keywords = await SearchHistoryService.getPopularKeywords(popularKeywordsPeriod, 10);
        setPopularKeywords(keywords);
      } catch (err) {
        console.error('Error fetching popular keywords:', err);
        setPopularKeywords([
          { query: 'audience research', count: 0 },
          { query: 'pain points', count: 0 },
          { query: 'trend signals', count: 0 },
          { query: 'content ideas', count: 0 },
          { query: 'community insights', count: 0 }
        ]);
      } finally {
        setLoadingPopularKeywords(false);
      }
    };

    fetchPopularKeywords();
  }, [popularKeywordsPeriod]);

  if (currentStep === 'results' && searchResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Enhanced AI Search</h1>
                {user && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <span>{user?.email}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs text-white ${
                      user?.subscription_tier === 'pro' ? 'bg-indigo-600' : 
                      user?.subscription_tier === 'standard' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}>
                      {user?.subscription_tier?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={onHome} className="text-gray-600 hover:text-gray-900">Home</button>
                <button onClick={onContact} className="text-gray-600 hover:text-gray-900">Contact</button>
                {user ? (
                  <button onClick={onSignOut} className="text-red-600 hover:text-red-700">Sign Out</button>
                ) : (
                  <>
                    <button onClick={onLogin} className="text-gray-600 hover:text-gray-900">Log In</button>
                    <button
                      onClick={onSignUp}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow space-y-6">
          <PlatformStatsBar />

          <div className="bg-white shadow-sm border rounded-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentStep('category')}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Category Selection
                </button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Results for "{searchQuery}"
                  </h1>
                  <p className="text-sm text-gray-600">
                    {selectedSubtopic?.title} • {searchMetadata?.category}
                  </p>
                </div>
              </div>
              <button
                onClick={resetSearch}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                New Search
              </button>
            </div>

          <ResultsPage 
            results={searchResults}
            metadata={searchMetadata}
            searchQuery={searchQuery}
            onBack={() => setCurrentStep('category')}
            onHome={onHome}
            onContact={onContact}
            onBlog={onBlog}
            onLogin={onLogin}
            onSignUp={onSignUp}
            onPrivacyPolicy={onPrivacyPolicy}
            onTermsAndConditions={onTermsAndConditions}
            user={user}
            onSignOut={onSignOut}
          />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Enhanced AI Search</h1>
              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  <span>{user?.email}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs text-white ${
                    user?.subscription_tier === 'pro' ? 'bg-indigo-600' : 
                    user?.subscription_tier === 'standard' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {user?.subscription_tier?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={onHome} className="text-gray-600 hover:text-gray-900">Home</button>
              <button onClick={onContact} className="text-gray-600 hover:text-gray-900">Contact</button>
              {user ? (
                <button onClick={onSignOut} className="text-red-600 hover:text-red-700">Sign Out</button>
              ) : (
                <>
                  <button onClick={onLogin} className="text-gray-600 hover:text-gray-900">Log In</button>
                  <button
                    onClick={onSignUp}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-8">
        <PlatformStatsBar />

        <div className="max-w-4xl mx-auto px-0 py-0 space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">
                Enhanced Research Dashboard
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get precise, relevant insights with our AI-powered multi-step search process
            </p>
          </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep === 'search' ? 'text-blue-600' : currentStep === 'expansion' || currentStep === 'category' || currentStep === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'search' ? 'bg-blue-600 text-white' : currentStep === 'expansion' || currentStep === 'category' || currentStep === 'results' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <span className="font-medium">Search</span>
              </div>
              <div className={`w-16 h-1 rounded-full ${currentStep === 'expansion' || currentStep === 'category' || currentStep === 'results' ? 'bg-green-600' : 'bg-gray-200'}`} />
              <div className={`flex items-center space-x-2 ${currentStep === 'expansion' ? 'text-blue-600' : currentStep === 'category' || currentStep === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'expansion' ? 'bg-blue-600 text-white' : currentStep === 'category' || currentStep === 'results' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <span className="font-medium">Focus</span>
              </div>
              <div className={`w-16 h-1 rounded-full ${currentStep === 'category' || currentStep === 'results' ? 'bg-green-600' : 'bg-gray-200'}`} />
              <div className={`flex items-center space-x-2 ${currentStep === 'category' ? 'text-blue-600' : currentStep === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'category' ? 'bg-blue-600 text-white' : currentStep === 'results' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  3
                </div>
                <span className="font-medium">Results</span>
              </div>
            </div>

            {/* Search Input */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleInitialSearch()}
                  placeholder="What would you like to research? (e.g., 'Sales engagement', 'Plant disease', 'Marketing automation')"
                  className="w-full px-6 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading || currentStep !== 'search'}
                />
                <button
                  onClick={handleInitialSearch}
                  disabled={!searchQuery.trim() || isLoading || currentStep !== 'search'}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-red-600 hover:text-red-800 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Current Step Info */}
              {currentStep === 'search' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">💡 How it works:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Enter your topic of interest</li>
                    <li>• AI will generate specific focus areas</li>
                    <li>• Choose what type of insights you want</li>
                    <li>• Get highly relevant, filtered results</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trending Searches */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trending className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Trending Searches</h2>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['day', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setPopularKeywordsPeriod(period)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    popularKeywordsPeriod === period
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loadingPopularKeywords ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {popularKeywords.map((keyword, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(keyword.query)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
                    <Trending className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="font-medium text-gray-900 truncate" title={keyword.query}>
                    {keyword.query}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {keyword.count} searches
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Feature Capsules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Pain Points Analysis</h3>
            <p className="text-gray-600">
              Discover what your audience is struggling with. We analyze sentiment and frustration markers to identify high-value problems.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Trending className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Trend Detection</h3>
            <p className="text-gray-600">
              Spot emerging topics before they go mainstream. We track velocity and engagement across multiple platforms.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl border border-green-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Content Ideas</h3>
            <p className="text-gray-600">
              Get AI-generated content suggestions based on real user data. Turn insights into viral content instantly.
            </p>
          </div>
        </div>

        {/* Modals */}
        <QueryExpansionModal
          isOpen={currentStep === 'expansion'}
          onClose={() => setCurrentStep('search')}
          originalQuery={searchQuery}
          subtopics={subtopics}
          onSelectSubtopic={handleSubtopicSelection}
          onCustomInput={handleCustomQuery}
          isLoading={isLoading}
        />

        <CategorySelectionModal
          isOpen={currentStep === 'category'}
          onClose={() => setCurrentStep('expansion')}
          selectedSubtopic={selectedSubtopic!}
          onSelectCategory={(categories) => {
            if (categories && categories.length > 0) {
              handleCategorySelection(categories[0]);
            }
          }}
        />
        </div>
      </div>
    </div>
  );
};
