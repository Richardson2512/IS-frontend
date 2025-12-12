import React, { useState, useEffect } from 'react';
import { 
  TrendingUp as Trending, 
  MessageSquare, 
  Lightbulb, 
  ExternalLink, 
  Twitter, 
  Youtube, 
  Calendar, 
  Globe, 
  Keyboard, 
  ChevronDown, 
  Mail,
  Facebook,
  Instagram,
  Delete,
  Space,
  AlertCircle,
  Loader,
  Circle,
  Video,
  Image,
  Search
} from 'lucide-react';
import { SearchService, SearchResponse } from '../services/searchService';
import { SearchParams, AnalyzedResults, SocialPost } from '../services/apiConfig';
import { SearchHistoryService } from '../services/searchHistoryService';
import { MetaPixelService } from '../services/metaPixelService';
import { EnhancedSearchBar } from './EnhancedSearchBar';
import { PlatformStatsBar } from './PlatformStatsBar';
import { Footer } from './Footer';
import { FilterBar } from './FilterBar';

interface ResearchDashboardProps {
  onHome: () => void;
  onContact: () => void;
  onBlog: () => void;
  onLogin: () => void;
  onSignUp: () => void;
  user: { 
    id: string;
    name: string; 
    email: string;
    subscription_tier: 'free' | 'standard' | 'pro';
    search_count: number;
  } | null;
  searchCount: number;
  onSearchLimitReached: () => void;
  onPrivacyPolicy: () => void;
  onTermsAndConditions: () => void;
  onSearchPerformed: () => void;
  onSignOut: () => void;
  onShowResults: (results: AnalyzedResults, query: string, noResultsMessage?: {
    title: string;
    message: string;
    reasons: string[];
    suggestions: string[];
    tip: string;
  }) => void;
  onPricing: () => void;
}

const ResearchDashboard: React.FC<ResearchDashboardProps> = ({
  onHome, onContact, onBlog, onLogin, onSignUp, user, searchCount, onSearchLimitReached, onPrivacyPolicy, onTermsAndConditions, onSearchPerformed, onSignOut, onShowResults, onPricing
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [timeFilter, setTimeFilter] = useState('week');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['reddit', 'youtube', 'tiktok', 'instagram', 'threads']);
  const [results, setResults] = useState<AnalyzedResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [showKeyboardSettings, setShowKeyboardSettings] = useState(false);
  const [keyboardLanguage, setKeyboardLanguage] = useState('en');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [virtualText, setVirtualText] = useState('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [popularKeywords, setPopularKeywords] = useState<Array<{ query: string; count: number }>>([]);
  const [popularKeywordsPeriod, setPopularKeywordsPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [loadingPopularKeywords, setLoadingPopularKeywords] = useState(false);

  useEffect(() => {
    MetaPixelService.trackPageView('research-dashboard');
  }, []);

  // Fetch popular keywords when component mounts or period changes
  useEffect(() => {
    const fetchPopularKeywords = async () => {
      setLoadingPopularKeywords(true);
      try {
        const keywords = await SearchHistoryService.getPopularKeywords(popularKeywordsPeriod, 10);
        setPopularKeywords(keywords);
      } catch (error) {
        console.error('Error fetching popular keywords:', error);
        // Fallback to default keywords if fetch fails
        setPopularKeywords([
          { query: 'fitness motivation', count: 0 },
          { query: 'remote work tips', count: 0 },
          { query: 'digital marketing', count: 0 },
          { query: 'mental health', count: 0 },
          { query: 'content creation', count: 0 }
        ]);
      } finally {
        setLoadingPopularKeywords(false);
      }
    };

    fetchPopularKeywords();
  }, [popularKeywordsPeriod]);

  const userTier = user?.subscription_tier || 'free';
  const tierLimits = SearchService.getTierLimits(userTier);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
  ];

  const timeFilters = [
    { value: 'hour', label: 'Past Hour' },
    { value: 'day', label: 'Past 24 Hours' },
    { value: 'week', label: 'Past Week' },
    { value: 'month', label: 'Past Month' },
    { value: 'year', label: 'Past Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const platforms = [
    { 
      id: 'reddit', 
      name: 'Reddit', 
      logo: 'https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png',
      available: true 
    },
    { 
      id: 'youtube', 
      name: 'YouTube', 
      logo: 'https://www.youtube.com/s/desktop/favicon_48x48.png',
      available: true 
    },
    { 
      id: 'tiktok', 
      name: 'TikTok', 
      icon: <Video className="w-5 h-5 text-black" />,
      available: true 
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: <Instagram className="w-5 h-5 text-pink-600" />,
      available: true 
    },
    { 
      id: 'threads', 
      name: 'Threads', 
      logo: 'https://static.xx.fbcdn.net/rsrc.php/yb/r/hLRJ1GG_y0J.ico',
      available: true 
    },
    { 
      id: 'pinterest', 
      name: 'Pinterest', 
      icon: <Image className="w-5 h-5 text-red-600" />,
      available: true 
    },
    { 
      id: 'google', 
      name: 'Google', 
      icon: <Search className="w-5 h-5 text-blue-500" />,
      available: true 
    }
  ];

  // Keyboard layouts for different languages
  const keyboardLayouts = {
    en: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ],
    es: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      ['á', 'é', 'í', 'ó', 'ú', 'ü', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Ü']
    ],
    fr: [
      ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
      ['w', 'x', 'c', 'v', 'b', 'n'],
      ['à', 'â', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô'],
      ['ù', 'û', 'ü', 'ÿ', 'À', 'Â', 'Ç', 'É', 'È', 'Ê'],
      ['Ë', 'Î', 'Ï', 'Ô', 'Ù', 'Û', 'Ü', 'Ÿ']
    ],
    de: [
      ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
      ['y', 'x', 'c', 'v', 'b', 'n', 'm']
    ],
    pt: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      ['á', 'à', 'â', 'ã', 'ç', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú'],
      ['Á', 'À', 'Â', 'Ã', 'Ç', 'É', 'Ê', 'Í', 'Ó', 'Ô', 'Õ', 'Ú']
    ],
    it: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      ['à', 'è', 'é', 'ì', 'ò', 'ù', 'À', 'È', 'É', 'Ì', 'Ò', 'Ù']
    ],
    ru: [
      ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х'],
      ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
      ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю']
    ],
    ar: [
      ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج'],
      ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
      ['ذ', 'د', 'ز', 'ر', 'و', 'ة', 'ى', 'ء']
    ],
    hi: [
      ['औ', 'ै', 'ा', 'ी', 'ू', 'ब', 'ह', 'ग', 'द', 'ज', 'ड'],
      ['ो', 'े', '्', 'ि', 'ु', 'प', 'र', 'क', 'त', 'च', 'ट'],
      ['ॉ', 'ं', 'म', 'न', 'व', 'ल', 'स', 'य']
    ],
    zh: [
      ['拼', '音', '输', '入', '法', '中', '文', '键', '盘', '布', '局'],
      ['汉', '字', '输', '入', '方', '式', '简', '体', '中', '文'],
      ['繁', '体', '字', '符', '输', '入']
    ],
    ja: [
      ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'],
      ['い', 'き', 'し', 'ち', 'に', 'ひ', 'み', 'り', 'を'],
      ['う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'ゆ', 'る', 'ん']
    ],
    ko: [
      ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
      ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
      ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ']
    ],
    nl: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      ['á', 'à', 'ä', 'é', 'è', 'ë', 'í', 'ï', 'ó', 'ò', 'ö', 'ú'],
      ['ù', 'ü', 'ý', 'ÿ', 'Á', 'À', 'Ä', 'É', 'È', 'Ë', 'Í', 'Ï'],
      ['Ó', 'Ò', 'Ö', 'Ú', 'Ù', 'Ü', 'Ý', 'Ÿ']
    ]
  };

  const handlePlatformToggle = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform?.available) return;

    setSelectedPlatforms(prev => {
      const newSelection = prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId];
      
      // Ensure at least one platform is selected
      if (newSelection.length === 0) {
        return prev; // Don't allow deselecting the last platform
      }
      
      return newSelection;
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.platform-dropdown')) {
        setShowPlatformDropdown(false);
      }
      if (!target.closest('.language-dropdown')) {
        setShowLanguageDropdown(false);
      }
      if (!target.closest('.time-dropdown')) {
        setShowTimeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyboardInput = (key: string) => {
    if (key === 'SPACE') {
      setVirtualText(prev => prev + ' ');
    } else if (key === 'DELETE') {
      setVirtualText(prev => prev.slice(0, -1));
    } else {
      setVirtualText(prev => prev + key);
    }
  };

  const transferToSearch = () => {
    setSearchQuery(virtualText);
    setVirtualText('');
  };

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage);
  const currentKeyboardLanguage = languages.find(lang => lang.code === keyboardLanguage);
  const currentTimeFilter = timeFilters.find(filter => filter.value === timeFilter);
  
  // Format custom date range display
  const getTimeFilterLabel = () => {
    if (timeFilter === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate).toLocaleDateString();
      const end = new Date(customEndDate).toLocaleDateString();
      return `${start} - ${end}`;
    }
    return currentTimeFilter?.label || 'Past Week';
  };

  const renderResultSection = (title: string, icon: React.ReactNode, results: SocialPost[], bgColor: string) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className={`flex items-center gap-3 mb-4 ${bgColor} -m-6 p-4 rounded-t-lg`}>
        {icon}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="ml-auto bg-white/20 px-2 py-1 rounded text-white text-sm">
          {results.length} results
        </span>
      </div>
      <div className="space-y-4 pt-4">
        {results.slice(0, 3).map((post, idx) => (
          <div key={idx} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
            <p className="text-gray-800 line-clamp-3 mb-2">{post.content}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{post.source}</span>
              <span className="flex items-center gap-1">
                <Trending className="w-3 h-3" /> {post.engagement}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Research Dashboard</h1>
                {user && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <span>{user?.email}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs text-white ${
                      userTier === 'pro' ? 'bg-indigo-600' : 
                      userTier === 'standard' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}>
                      {userTier.toUpperCase()}
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

            <FilterBar
              platforms={platforms}
              selectedPlatforms={selectedPlatforms}
              onTogglePlatform={handlePlatformToggle}
              language={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
            />

            <FilterBar
              platforms={platforms}
              selectedPlatforms={selectedPlatforms}
              onTogglePlatform={handlePlatformToggle}
              language={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
            />

            {/* Enhanced Search Bar */}
            <EnhancedSearchBar
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
              selectedPlatforms={selectedPlatforms}
              onPlatformToggle={handlePlatformToggle}
              onSearch={(query) => {
                setSearchQuery(query);
              }}
              isLoading={isLoading}
              userTier={userTier}
              searchCount={searchCount}
              maxSearches={tierLimits.maxSearches}
              onShowResults={onShowResults}
              onSearchLimitReached={onSearchLimitReached}
              onSearchPerformed={onSearchPerformed}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <PlatformStatsBar />
        
        {/* Popular Keywords Section */}
        <div className="mb-12">
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

        {/* Features Grid */}
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

export default ResearchDashboard;

