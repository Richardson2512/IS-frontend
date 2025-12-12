import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { SearchService, Subtopic } from '../services/searchService';
import { QueryExpansionModal } from './QueryExpansionModal';
import { CategorySelectionModal } from './CategorySelectionModal';
import { VirtualKeyboard } from './VirtualKeyboard';

interface EnhancedSearchBarProps {
  onSearchComplete: (results: any, query: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  userTier: 'free' | 'standard' | 'pro';
  onSearchPerformed?: () => void; // Add callback for search count update
  searchQuery?: string; // Add prop for external search query
  onSearchQueryChange?: (query: string) => void; // Add callback for query changes
  searchCount?: number;
  maxSearches?: number;
  onShowResults?: (results: any, query: string) => void;
  onSearchLimitReached?: () => void;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  onSearchComplete,
  isLoading,
  setIsLoading,
  userTier,
  onSearchPerformed,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  searchCount,
  maxSearches,
  onSearchLimitReached
}) => {
  // Multi-step search state - Define all state first
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'search' | 'expansion' | 'category'>('search');
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
  
  // Track if auto-search has been triggered to avoid infinite loops
  const autoSearchTriggeredRef = useRef<string | null>(null);

  // Update parent when internal search query changes
  const handleSearchQueryChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    if (onSearchQueryChange) {
      onSearchQueryChange(newQuery);
    }
  };

  // Core search function that can be called from anywhere
  const performInitialSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      console.log('❌ No search query provided');
      return;
    }

    console.log('🚀 SEARCH BUTTON CLICKED - Starting search process');
    console.log('📝 Search query:', searchQuery);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    // Set loading for focus generation (will show different message)
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Step 1: Generating focus points for:', searchQuery);
      console.log('🔄 Calling SearchService.generateQueryExpansion...');
      
      // Step 1: Generate query expansion options (focus points)
      // This should NOT show "Analyzing social media posts" - that comes later
      const expansionResponse = await SearchService.generateQueryExpansion(searchQuery.trim());
      
      if (expansionResponse.success && expansionResponse.data.subtopics.length > 0) {
        setSubtopics(expansionResponse.data.subtopics);
        setCurrentStep('expansion'); // Show focus modal
        console.log('✅ Step 1 Complete: Query expansion generated, showing focus selection modal');
        // Loading is done - focus modal will be shown
      } else {
        throw new Error('Failed to generate search options');
      }
    } catch (err) {
      console.error('❌ Query expansion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate search options');
    } finally {
      // Stop loading after focus points are generated
      // The actual "Analyzing social media posts" loading happens in handleCategorySelection
      setIsLoading(false);
    }
  }, [searchQuery, setIsLoading]);

  // Debug: Log when searchQuery changes
  useEffect(() => {
    if (searchQuery) {
      console.log('🔍 Search query updated to:', searchQuery);
    }
  }, [searchQuery]);

  // Sync external search query with internal state
  useEffect(() => {
    if (externalSearchQuery && externalSearchQuery !== searchQuery) {
      console.log('🔄 External search query changed:', externalSearchQuery);
      setSearchQuery(externalSearchQuery);
      // Reset auto-search trigger when external query changes
      autoSearchTriggeredRef.current = null;
    }
  }, [externalSearchQuery, searchQuery]);

  // Note: Removed auto-trigger search - users should click search button manually
  // This allows popular keywords to populate the search bar without auto-starting search

  // Languages for virtual keyboard
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
  ];

  const handleInitialSearch = async () => {
    await performInitialSearch();
  };

  const handleSubtopicSelection = (subtopic: Subtopic) => {
    console.log('📝 User selected subtopic:', subtopic.title);
    console.log('📝 Subtopic details:', subtopic);
    setSelectedSubtopic(subtopic);
    setCurrentStep('category');
    console.log('📝 Moved to category selection step');
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

  const handleCategorySelection = async (categories: ('pain-points' | 'trending-ideas' | 'content-ideas')[]) => {
    if (!selectedSubtopic || categories.length === 0) {
      console.log('❌ No subtopic or categories selected');
      return;
    }

    console.log('🎯 Step 2: Category selection triggered:', {
      subtopic: selectedSubtopic.title,
      categories,
      expandedQuery: selectedSubtopic.expandedQuery
    });

    // Hide the modal first
    setCurrentStep('search');
    // NOW set loading - this is when "Analyzing social media posts" should show
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Step 3: Starting to analyze social media posts...');
      console.log('📡 Analyzing with:', {
        subtopic: selectedSubtopic.title,
        expandedQuery: selectedSubtopic.expandedQuery,
        categories,
        platforms: ['reddit', 'x', 'youtube', 'linkedin', 'threads']
      });

      // Step 2: Perform searches for each selected category (this analyzes posts)
      const searchPromises = categories.map(category => 
        SearchService.performFocusedSearch(
          searchQuery,
          selectedSubtopic.expandedQuery,
          category,
          {
            platforms: ['reddit', 'x', 'youtube', 'linkedin', 'threads'],
            timeFilter: 'week',
            language: 'en'
          }
        )
      );

      console.log('⏳ Waiting for all analysis operations to complete...');
      const searchResponses = await Promise.all(searchPromises);
      console.log('✅ Step 3 Complete: All posts analyzed, now segregating...');
      
      console.log('🔍 Step 4: Segregating posts into categories...');
      
      // Step 3: Combine and segregate results from all categories
      const formattedResults = {
        painPoints: [],
        trendingIdeas: [],
        contentIdeas: [],
        metadata: {
          expandedQuery: selectedSubtopic.expandedQuery,
          selectedCategories: categories,
          totalResults: 0
        }
      };

      searchResponses.forEach((response, index) => {
        if (response.success) {
          const category = categories[index];
          formattedResults[category === 'pain-points' ? 'painPoints' : 
                          category === 'trending-ideas' ? 'trendingIdeas' : 'contentIdeas'] = response.data.results;
          formattedResults.metadata.totalResults += response.data.results.length;
        }
      });
      
      console.log('✅ Step 4 Complete: Posts segregated. Pushing to frontend...');
      console.log('📊 Final results:', {
        painPoints: formattedResults.painPoints.length,
        trendingIdeas: formattedResults.trendingIdeas.length,
        contentIdeas: formattedResults.contentIdeas.length,
        totalResults: formattedResults.metadata.totalResults
      });
      
      // Step 4: Push results to frontend
      onSearchComplete(formattedResults, selectedSubtopic.expandedQuery);
      console.log('✅ Step 5 Complete: Results displayed on frontend');
      
      // Update search count
      if (onSearchPerformed) {
        onSearchPerformed();
      }
      
      // Reset state and hide modal
      resetSearch();
    } catch (err) {
      console.error('❌ Focused search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setCurrentStep('search');
    setSubtopics([]);
    setSelectedSubtopic(null);
    setError(null);
  };

  const goBack = () => {
    if (currentStep === 'expansion') {
      setCurrentStep('search');
    } else if (currentStep === 'category') {
      setCurrentStep('expansion');
    }
  };

  return (
    <>
      {/* Enhanced Search Input */}
      <div>
        <div className="flex justify-between items-end mb-2">
          <label className="block text-sm font-medium text-gray-700">
            What insights are you looking for?
          </label>
          {maxSearches !== undefined && searchCount !== undefined && (
             <span className={`text-xs px-2 py-1 rounded-full font-medium ${
               searchCount >= maxSearches 
                 ? 'bg-red-100 text-red-800' 
                 : 'bg-indigo-50 text-indigo-700'
             }`}>
               Daily Searches: {searchCount} / {maxSearches}
             </span>
          )}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Search with <strong>one keyword at a time</strong> for best results (e.g., "AI marketing" instead of "AI marketing tools for social media")
          </p>
        </div>
        
        {/* Progress Indicator */}
        {currentStep !== 'search' && (
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'expansion' ? 'text-blue-600' : currentStep === 'category' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${currentStep === 'expansion' ? 'bg-blue-600 text-white' : currentStep === 'category' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <span className="text-sm font-medium">Search</span>
            </div>
            <div className={`w-12 h-1 rounded-full ${currentStep === 'expansion' || currentStep === 'category' ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center space-x-2 ${currentStep === 'expansion' ? 'text-blue-600' : currentStep === 'category' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${currentStep === 'expansion' ? 'bg-blue-600 text-white' : currentStep === 'category' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <span className="text-sm font-medium">Focus</span>
            </div>
            <div className={`w-12 h-1 rounded-full ${currentStep === 'category' ? 'bg-green-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center space-x-2 ${currentStep === 'category' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${currentStep === 'category' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
              <span className="text-sm font-medium">Results</span>
            </div>
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchQueryChange(e.target.value)}
            placeholder="e.g., AI marketing, content creation, productivity tips..."
            className="w-full px-4 py-3 pr-32 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && currentStep === 'search' && !isLoading) {
                console.log('⌨️ ENTER KEY PRESSED');
                console.log('📝 Current search query:', searchQuery);
                handleInitialSearch();
              }
            }}
            disabled={isLoading}
          />
          <button
            onClick={() => {
              if (currentStep === 'search' && !isLoading) {
                console.log('🔘 SEARCH BUTTON CLICKED');
                console.log('📝 Current search query:', searchQuery);
                console.log('🔄 Current step:', currentStep);
                console.log('⏳ Loading state:', isLoading);
                handleInitialSearch();
              }
            }}
            disabled={!searchQuery.trim() || isLoading || currentStep !== 'search'}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <Search className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
            >
              Dismiss
            </button>
          </div>
        )}


        {/* Back Button */}
        {currentStep !== 'search' && (
          <div className="mt-3">
            <button
              onClick={goBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to {currentStep === 'expansion' ? 'Search' : 'Focus Selection'}
            </button>
          </div>
        )}
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

      {/* Virtual Keyboard */}
      <VirtualKeyboard 
        onTextChange={setSearchQuery}
        languages={languages}
      />
    </>
  );
};
