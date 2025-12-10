import React, { useState } from 'react';
import { Search, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { SearchService } from '../../services/searchService';
import { AdPlatform } from '../../services/apiConfig';

interface AdSearchDashboardProps {
  onBack: () => void;
  userTier?: 'free' | 'standard' | 'pro';
}

export const AdSearchDashboard: React.FC<AdSearchDashboardProps> = ({ onBack, userTier = 'free' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<AdPlatform[]>(['facebook', 'google', 'linkedin']);

  const adPlatforms: { id: AdPlatform; name: string; icon: string }[] = [
    { id: 'facebook', name: 'Facebook Ads', icon: 'f' },
    { id: 'google', name: 'Google Ads', icon: 'G' },
    { id: 'linkedin', name: 'LinkedIn Ads', icon: 'in' },
    { id: 'reddit', name: 'Reddit Ads', icon: 'r' },
    { id: 'tiktok_shop', name: 'TikTok Shop', icon: 'Tk' },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim() || selectedPlatforms.length === 0) return;

    setIsLoading(true);
    setError(null);
    setAds([]);

    try {
      const results = await SearchService.performAdSearch(searchQuery, selectedPlatforms, { userTier });
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Content Search
            </button>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-900">Ad Intelligence</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
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

            {/* Platform Selection */}
            <div className="flex flex-wrap gap-3">
              {adPlatforms.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`flex items-center px-4 py-2 rounded-full border transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-xs font-bold mr-2">
                    {platform.icon}
                  </span>
                  {platform.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
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
      </div>
    </div>
  );
};

