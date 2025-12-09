import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Home, 
  ExternalLink, 
  Twitter, 
  Youtube, 
  MessageSquare, 
  TrendingUp, 
  Lightbulb,
  Sparkles,
  Crown,
  Mail,
  Facebook,
  Instagram
} from 'lucide-react';
import { AnalyzedResults, SocialPost } from '../services/apiConfig';
import ScriptGenerationModal from './ScriptGenerationModal';
import RelevanceRating from './RelevanceRating';
import { MetaPixelService } from '../services/metaPixelService';

interface ResultsPageProps {
  results: AnalyzedResults;
  searchQuery: string;
  metadata?: {
    noRelevantContent?: boolean;
    message?: string;
    availablePosts?: number;
    totalPosts?: number;
    category?: string;
    expandedQuery?: string;
    [key: string]: any;
  };
  noResultsMessage?: {
    title: string;
    message: string;
    reasons: string[];
    suggestions: string[];
    tip: string;
  };
  onBack: () => void;
  onHome: () => void;
  onContact: () => void;
  onBlog: () => void;
  onLogin: () => void;
  onSignUp: () => void;
  onPrivacyPolicy: () => void;
  onTermsAndConditions: () => void;
  user: { 
    id: string;
    name: string; 
    email: string;
    subscription_tier: 'free' | 'standard' | 'pro';
    search_count: number;
  } | null;
  onSignOut: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({
  results,
  searchQuery,
  metadata,
  noResultsMessage,
  onBack,
  onHome,
  onContact,
  onBlog,
  onLogin,
  onSignUp,
  onPrivacyPolicy,
  onTermsAndConditions,
  user,
  onSignOut
}) => {
  useEffect(() => {
    MetaPixelService.trackPageView('results');
  }, []);

  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [scriptModalCategory, setScriptModalCategory] = useState<'painPoints' | 'trendingIdeas' | 'contentIdeas'>('painPoints');
  const [scriptModalPosts, setScriptModalPosts] = useState<SocialPost[]>([]);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const userTier = user?.subscription_tier || 'free';
  const tierLimits = {
    free: 3,      // 3 total results combined
    standard: 9,  // 3 per platform × 3 platforms
    pro: 15       // 5 per platform × 3 platforms
  };

  const handleGenerateScript = (category: 'painPoints' | 'trendingIdeas' | 'contentIdeas', posts: SocialPost[]) => {
    setScriptModalCategory(category);
    setScriptModalPosts(posts);
    setScriptModalOpen(true);
  };

  // Content truncation utilities
  const MAX_CONTENT_LENGTH = 200; // Characters to show before truncation
  const truncateContent = (content: string, maxLength: number = MAX_CONTENT_LENGTH) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const togglePostExpansion = (postId: string) => {
    const newExpandedPosts = new Set(expandedPosts);
    if (newExpandedPosts.has(postId)) {
      newExpandedPosts.delete(postId);
    } else {
      newExpandedPosts.add(postId);
    }
    setExpandedPosts(newExpandedPosts);
  };


  const renderResultCard = (
    title: string, 
    icon: React.ReactNode, 
    results: SocialPost[], 
    bgColor: string, 
    category: 'painPoints' | 'trendingIdeas' | 'contentIdeas'
  ) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col max-h-[700px]">
      {/* Header */}
      <div className={`${bgColor} p-6 rounded-t-xl`}>
        <div className="flex items-center gap-3 text-white">
          {icon}
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-white/80 text-sm">
            {results.length} of {tierLimits[userTier]} results
          </span>
          {userTier !== 'free' && userTier === 'pro' && (
            <Crown className="w-5 h-5 text-yellow-300" />
          )}
        </div>
      </div>

      {/* Results */}
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">{icon}</div>
              <p className="text-gray-500">No results found for this category</p>
            </div>
          ) : (
            results.map((result) => (
              <div key={result.id} className="border border-gray-100 rounded-lg p-6 hover:shadow-md transition-shadow max-h-[400px] overflow-y-auto">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {result.platform === 'reddit' && (
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        r
                      </div>
                    )}
                    {result.platform === 'x' && <Twitter className="w-6 h-6 text-blue-500" />}
                    {result.platform === 'youtube' && <Youtube className="w-6 h-6 text-red-500" />}
                    {result.platform === 'linkedin' && (
                      <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                        in
                      </div>
                    )}
                    {result.platform === 'threads' && (
                      <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white text-xs font-bold">
                        @
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-4">
                      <p className="text-gray-900 text-base leading-relaxed">
                        {expandedPosts.has(result.id) ? result.content : truncateContent(result.content)}
                      </p>
                      {result.content.length > MAX_CONTENT_LENGTH && (
                        <button
                          onClick={() => togglePostExpansion(result.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 hover:underline inline-flex items-center gap-1"
                        >
                          {expandedPosts.has(result.id) ? (
                            <>
                              <span>Show Less</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </>
                          ) : (
                            <>
                              <span>Read More</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {/* Relevance Rating Component */}
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Rate this result's relevance:</p>
                          <RelevanceRating
                            postId={result.id}
                            platform={result.platform}
                            searchQuery={searchQuery}
                            userId={user?.id}
                            onRatingSubmit={(rating) => {
                              console.log(`Rated ${result.id} as ${rating}/5 for query: ${searchQuery}`);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="font-medium">{result.source}</span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {result.engagement} engagement
                        </span>
                        <span>{result.timestamp}</span>
                        {result.url && (
                          <a 
                            href={result.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Original
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleGenerateScript(category, [result])}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-all text-xs font-medium shadow-sm hover:shadow-md"
                      >
                        <Sparkles className="w-3 h-3" />
                        Generate Script
                        {userTier === 'free' && <Crown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-0">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <button 
                onClick={onHome}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/logo.png" 
                  alt="InsightSnap Logo" 
                  className="w-16 h-16"
                />
              </button>
              <button 
                onClick={onHome}
                className="text-xl font-bold hover:text-indigo-600 transition-colors"
              >
                InsightSnap
              </button>
            </div>
            
            {/* Center Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={onHome}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2"
              >
                Home
              </button>
              <button 
                onClick={onBlog}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2"
              >
                Blog
              </button>
              <button 
                onClick={onContact}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2"
              >
                Contact
              </button>
            </div>
            
            {/* Right side */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">
                      {user.name}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        userTier === 'pro' ? 'bg-purple-100 text-purple-800' :
                        userTier === 'standard' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {userTier.charAt(0).toUpperCase() + userTier.slice(1)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {tierLimits[userTier]} results per category
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {onSignOut && (
                      <button
                        onClick={onSignOut}
                        className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onLogin}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={onSignUp}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Insights for "{searchQuery}"
          </h1>
          <p className="text-gray-600">
            AI-powered analysis from social media discussions
          </p>
        </div>

        {/* No Results Message */}
        {noResultsMessage && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {noResultsMessage.title}
                </h3>
                <p className="text-blue-800 mb-4">
                  {noResultsMessage.message}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Possible reasons:</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                      {noResultsMessage.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Suggestions:</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                      {noResultsMessage.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-blue-100 rounded-lg p-3 mt-4">
                    <p className="text-blue-800 text-sm">
                      <strong>💡 Tip:</strong> {noResultsMessage.tip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Relevant Content Message */}
        {metadata?.noRelevantContent && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">
                  🔍 No Relevant Content Found
                </h3>
                <p className="text-amber-800 mb-4">
                  {metadata.message || `We couldn't find enough relevant content for "${metadata.expandedQuery || searchQuery}" in the current time period.`}
                </p>
                
                <div className="space-y-3">
                  <div className="bg-amber-100 rounded-lg p-3">
                    <p className="text-amber-800 text-sm">
                      <strong>📊 Search Stats:</strong> Found {metadata.availablePosts || 0} relevant posts out of {metadata.totalPosts || 0} total posts analyzed.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-amber-900 mb-2">Suggestions:</h4>
                    <ul className="list-disc list-inside space-y-1 text-amber-800 text-sm">
                      <li>Try a different focus area or search term</li>
                      <li>Expand your search to a longer time period</li>
                      <li>Use more general keywords instead of very specific ones</li>
                      <li>Try searching for related topics or synonyms</li>
                    </ul>
                  </div>
                  
                  <div className="bg-amber-100 rounded-lg p-3 mt-4">
                    <p className="text-amber-800 text-sm">
                      <strong>💡 Tip:</strong> Sometimes very specific searches have limited content. Try broadening your search terms to find more relevant results.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Grid - Column Layout */}
        <div className="space-y-8 mb-8">
          {/* Only show category boxes that have been selected (have results or metadata indicates selection) */}
          {(results.painPoints.length > 0 || results.metadata?.selectedCategories?.includes('pain-points')) && renderResultCard(
            'Pain Points',
            <MessageSquare className="w-6 h-6" />,
            results.painPoints,
            'bg-red-600',
            'painPoints'
          )}

          {(results.trendingIdeas.length > 0 || results.metadata?.selectedCategories?.includes('trending-ideas')) && renderResultCard(
            'Trending Ideas',
            <TrendingUp className="w-6 h-6" />,
            results.trendingIdeas,
            'bg-green-600',
            'trendingIdeas'
          )}

          {(results.contentIdeas.length > 0 || results.metadata?.selectedCategories?.includes('content-ideas')) && renderResultCard(
            'Content Ideas',
            <Lightbulb className="w-6 h-6" />,
            results.contentIdeas,
            'bg-purple-600',
            'contentIdeas'
          )}
        </div>

        {/* Summary Stats - Only show selected categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Summary</h3>
          <div className={`grid gap-6 ${
            (results.metadata?.selectedCategories?.length || 3) === 1 ? 'grid-cols-1' :
            (results.metadata?.selectedCategories?.length || 3) === 2 ? 'grid-cols-2' :
            'grid-cols-2 md:grid-cols-4'
          }`}>
            {(results.painPoints.length > 0 || results.metadata?.selectedCategories?.includes('pain-points')) && (
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {results.painPoints.length}
                </div>
                <div className="text-base text-gray-600">Pain Points</div>
              </div>
            )}
            {(results.trendingIdeas.length > 0 || results.metadata?.selectedCategories?.includes('trending-ideas')) && (
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {results.trendingIdeas.length}
                </div>
                <div className="text-base text-gray-600">Trending Ideas</div>
              </div>
            )}
            {(results.contentIdeas.length > 0 || results.metadata?.selectedCategories?.includes('content-ideas')) && (
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {results.contentIdeas.length}
                </div>
                <div className="text-base text-gray-600">Content Ideas</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {results.painPoints.length + results.trendingIdeas.length + results.contentIdeas.length}
              </div>
              <div className="text-base text-gray-600">Total Results</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            New Search
          </button>
          <button
            onClick={onHome}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </main>

      {/* Script Generation Modal */}
      <ScriptGenerationModal
        isOpen={scriptModalOpen}
        onClose={() => setScriptModalOpen(false)}
        category={scriptModalCategory}
        posts={scriptModalPosts}
        userTier={userTier}
        userId={user?.id}
        onUpgrade={onSignUp}
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-0 mb-4">
                <button 
                  onClick={onHome}
                  className="flex items-center hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/logo.png" 
                    alt="InsightSnap Logo" 
                    className="w-16 h-16"
                  />
                </button>
                <button 
                  onClick={onHome}
                  className="text-xl font-bold hover:text-indigo-400 transition-colors"
                >
                  InsightSnap
                </button>
              </div>
              <p className="text-gray-400">
                Discover what your audience really wants with AI-powered social media insights.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:contact@insightsnap.co" className="hover:text-white transition-colors">
                    contact@insightsnap.co
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={onBlog}
                    className="hover:text-white transition-colors text-left w-full"
                  >
                    Blog
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onContact}
                    className="hover:text-white transition-colors text-left w-full"
                  >
                    Contact Us
                  </button>
                </li>
                 <li>
                  <button 
                    onClick={onPrivacyPolicy}
                    className="hover:text-white transition-colors text-left w-full"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onTermsAndConditions}
                    className="hover:text-white transition-colors text-left w-full"
                  >
                    Terms & Conditions
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://x.com/InsightSnapAI" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="X (Twitter)">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://www.facebook.com/InsightsnapAI/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/insightsnap.ai/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.youtube.com/@InsightSnap_AI" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="YouTube">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="https://www.reddit.com/user/InsightSnap/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Reddit">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 InsightSnap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResultsPage;
