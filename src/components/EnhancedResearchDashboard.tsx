import React, { useState } from 'react';
import { Search, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { SearchService, Subtopic } from '../services/searchService';
import { QueryExpansionModal } from './QueryExpansionModal';
import { CategorySelectionModal } from './CategorySelectionModal';
import ResultsPage from './ResultsPage';
import { Footer } from './Footer';

interface EnhancedResearchDashboardProps {
  userTier?: 'free' | 'standard' | 'pro';
  onSearchComplete?: (results: any) => void;
  onBack: () => void;
  user: any;
  onHome: () => void;
  onContact: () => void;
  onSignOut: () => void;
  onBlog: () => void;
  onPrivacyPolicy: () => void;
  onTermsAndConditions: () => void;
  searchCount?: number;
}

export const EnhancedResearchDashboard: React.FC<EnhancedResearchDashboardProps> = ({
  userTier = 'free',
  onSearchComplete,
  onBack,
  user,
  onHome,
  onContact,
  onSignOut,
  onBlog,
  onPrivacyPolicy,
  onTermsAndConditions,
  searchCount
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

  const goBack = () => {
    if (currentStep === 'expansion') {
      setCurrentStep('search');
    } else if (currentStep === 'category') {
      setCurrentStep('expansion');
    } else if (currentStep === 'results') {
      setCurrentStep('category');
    }
  };

  if (currentStep === 'results' && searchResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Unified Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Enhanced AI Search</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  <span>{user?.email}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs text-white ${
                    userTier === 'pro' ? 'bg-indigo-600' : 
                    userTier === 'standard' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {userTier.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button onClick={onHome} className="text-gray-600 hover:text-gray-900">Home</button>
                <button onClick={onContact} className="text-gray-600 hover:text-gray-900">Contact</button>
                <button onClick={onSignOut} className="text-red-600 hover:text-red-700">Sign Out</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sub-header for Back button */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <button
              onClick={onBack}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Content Search
            </button>
          </div>
        </div>

        <div className="flex-grow">
          {/* Results Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={goBack}
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
            </div>
          </div>
          
          <ResultsPage 
            results={searchResults}
            metadata={searchMetadata}
            searchQuery={searchQuery}
          />
        </div>

        <Footer 
          onContact={onContact}
          onBlog={onBlog}
          onPrivacyPolicy={onPrivacyPolicy}
          onTermsAndConditions={onTermsAndConditions}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Unified Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Enhanced AI Search</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <span>{user?.email}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs text-white ${
                  userTier === 'pro' ? 'bg-indigo-600' : 
                  userTier === 'standard' ? 'bg-blue-500' : 'bg-gray-500'
                }`}>
                  {userTier.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={onHome} className="text-gray-600 hover:text-gray-900">Home</button>
              <button onClick={onContact} className="text-gray-600 hover:text-gray-900">Contact</button>
              <button onClick={onSignOut} className="text-red-600 hover:text-red-700">Sign Out</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sub-header for Back button */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <button
            onClick={onBack}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Content Search
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 flex-grow">
        {/* Header */}
        <div className="text-center mb-12">
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
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
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
          onSelectCategory={handleCategorySelection}
        />

        <Footer 
          onContact={onContact}
          onBlog={onBlog}
          onPrivacyPolicy={onPrivacyPolicy}
          onTermsAndConditions={onTermsAndConditions}
        />
      </div>
    </div>
  );
};
