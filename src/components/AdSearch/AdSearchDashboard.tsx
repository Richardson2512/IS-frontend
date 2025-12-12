import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Loader2, Sparkles, TrendingUp as Trending, MessageSquare, Lightbulb } from 'lucide-react';
import { SearchService } from '../../services/searchService';
import { AdPlatform } from '../../services/apiConfig';
import { Footer } from '../Footer';
import { PlatformStatsBar } from '../PlatformStatsBar';
import { SearchHistoryService } from '../../services/searchHistoryService';
import { FilterBar } from '../FilterBar';
import { UpgradePrompt } from '../UpgradePrompt';

interface AdSearchDashboardProps {
  userTier?: 'free' | 'standard' | 'pro';
  user: any;
  onHome: () => void;
  onContact: () => void;
  onSignOut: () => void;
  onLogin: () => void;
  onSignUp: () => void;
  onBlog: () => void;
  onPrivacyPolicy: () => void;
  onTermsAndConditions: () => void;
  onPricing?: () => void;
  searchCount?: number;
}

export const AdSearchDashboard: React.FC<AdSearchDashboardProps> = ({ 
  userTier = 'free',
  user,
  onHome,
  onContact,
  onSignOut,
  onLogin,
  onSignUp,
  onBlog,
  onPrivacyPolicy,
  onTermsAndConditions,
  onPricing,
  searchCount
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<AdPlatform[]>(['facebook', 'google', 'linkedin']);
  const [popularKeywords, setPopularKeywords] = useState<Array<{ query: string; count: number }>>([]);
  const [popularKeywordsPeriod, setPopularKeywordsPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [loadingPopularKeywords, setLoadingPopularKeywords] = useState(false);
  const [timeFilter, setTimeFilter] = useState('week');
  const [language, setLanguage] = useState('en');

  const adPlatforms: { id: AdPlatform; name: string; icon?: React.ReactNode; logo?: string }[] = [
    { id: 'facebook', name: 'Facebook Ads', logo: 'https://www.facebook.com/images/fb_icon_325x325.png' },
    { id: 'google', name: 'Google Ads', logo: 'https://www.google.com/favicon.ico' },
    { id: 'linkedin', name: 'LinkedIn Ads', logo: 'https://static.licdn.com/scds/common/u/images/logos/favicons/v1/favicon.ico' },
    { id: 'reddit', name: 'Reddit Ads', logo: 'https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png' },
    { id: 'tiktok_shop', name: 'TikTok Shop', icon: <span className="text-xs font-bold">Tk</span> },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim() || selectedPlatforms.length === 0) return;

    setIsLoading(true);
    setError(null);
    setAds([]);

    try {
      const results = await SearchService.performAdSearch(searchQuery, selectedPlatforms, { userTier, timeFilter, language });
      setAds(results.ads || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search ads. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlatform = (platformId: AdPlatform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
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
          { query: 'ad creatives', count: 0 },
          { query: 'cpc benchmarks', count: 0 },
          { query: 'tiktok ads', count: 0 },
          { query: 'linkedin outreach', count: 0 },
          { query: 'google shopping', count: 0 }
        ]);
      } finally {
        setLoadingPopularKeywords(false);
      }
    };

    fetchPopularKeywords();
  }, [popularKeywordsPeriod]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Ad Intelligence</h1>
              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  <span>{user?.email}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs text-white ${
                    userTier === 'pro' ? 'bg-indigo-600' : 
                    userTier === 'standard' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {userTier?.toUpperCase()}
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

        <FilterBar
          platforms={adPlatforms}
          selectedPlatforms={selectedPlatforms}
          onTogglePlatform={(id) => togglePlatform(id as AdPlatform)}
          language={language}
          onLanguageChange={setLanguage}
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
        />

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for ads (e.g. 'AI marketing software')"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
              <button
                onClick={handleSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </button>
            </div>

            {/* How it works */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">💡 How it works:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Enter keywords related to products, services, or industries you want to research</li>
                <li>• We search ad libraries across Facebook, LinkedIn, Google, Reddit, and TikTok Shop</li>
                <li>• Discover competitor ad strategies, creative approaches, and messaging tactics</li>
                <li>• Analyze what's working in your industry and get inspiration for your own campaigns</li>
              </ul>
            </div>

            {/* Upgrade Prompt for Free and Standard Users */}
            {user && onPricing && (userTier === 'free' || userTier === 'standard') && (
              <UpgradePrompt userTier={userTier} onPricing={onPricing} />
            )}
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {ads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {ad.thumbnail && (
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img src={ad.thumbnail} alt={ad.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium uppercase">
                      {ad.platform}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(ad.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {ad.content || 'Ad Creative'}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span className="font-medium text-gray-700 mr-2">{ad.author || 'Advertiser'}</span>
                  </div>
                  <a
                    href={ad.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    View Ad Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && searchQuery && (
            <div className="text-center py-12 text-gray-500">
              No ads found. Try different keywords or platforms.
            </div>
          )
        )}

        {/* Trending Searches */}
        <div className="mt-12">
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
            <div className="flex justify-center py-8">
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
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Creative Insights</h3>
            <p className="text-gray-600">
              See what hooks and angles perform best across platforms and replicate winning patterns.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Trending className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Performance Trends</h3>
            <p className="text-gray-600">
              Track CPC, CTR, and conversion-friendly copy patterns by network to optimize budgets.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl border border-green-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Audience Ideas</h3>
            <p className="text-gray-600">
              Discover audience interests and keywords that align to high-performing ad segments.
            </p>
          </div>
        </div>
      </div>

      <Footer 
        onContact={onContact}
        onBlog={onBlog}
        onPrivacyPolicy={onPrivacyPolicy}
        onTermsAndConditions={onTermsAndConditions}
      />
    </div>
  );
};

