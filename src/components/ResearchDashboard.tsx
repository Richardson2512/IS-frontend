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
  Circle
} from 'lucide-react';
import { SearchService, SearchResponse } from '../services/searchService';
import { SearchParams, AnalyzedResults, SocialPost } from '../services/apiConfig';
import { SearchHistoryService } from '../services/searchHistoryService';
import { MetaPixelService } from '../services/metaPixelService';
import { EnhancedSearchBar } from './EnhancedSearchBar';
import { PlatformStatsBar } from './PlatformStatsBar';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [timeFilter, setTimeFilter] = useState('week');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['reddit', 'x', 'youtube', 'linkedin', 'threads']);
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
      id: 'x', 
      name: 'X (Twitter)', 
      logo: 'https://abs.twimg.com/favicons/twitter.3.ico',
      available: true 
    },
    { 
      id: 'youtube', 
      name: 'YouTube', 
      logo: 'https://www.youtube.com/s/desktop/favicon_48x48.png',
      available: true 
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      logo: 'https://static.licdn.com/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
      available: true 
    },
    { 
      id: 'threads', 
      name: 'Threads', 
      logo: 'https://static.xx.fbcdn.net/rsrc.php/yb/r/hLRJ1GG_y0J.ico',
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

  // Removed problematic useEffect that was causing infinite loading
  // handleSearch function removed - now handled by EnhancedSearchBar


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
      
      <div className="space-y-4 mt-6">
        {results.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No results found for this category</p>
        ) : (
          results.map((result) => (
            <div key={result.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {result.platform === 'reddit' && <Circle className="w-6 h-6 text-orange-500 fill-orange-500" />}
                  {result.platform === 'x' && <Twitter className="w-6 h-6 text-blue-500" />}
                  {result.platform === 'youtube' && <Youtube className="w-6 h-6 text-red-500" />}
                  {result.platform === 'linkedin' && <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">in</div>}
                  {result.platform === 'threads' && <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white text-xs font-bold">@</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-sm leading-relaxed mb-2">{result.content}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="font-medium">{result.source}</span>
                    <span>{result.engagement} engagement</span>
                    <span>{result.timestamp}</span>
                    {result.url && (
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
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
                onClick={onPricing}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2"
              >
                Pricing
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
                  <span className="text-sm text-gray-600">
                    {searchCount}/{tierLimits.maxSearches} searches today
                  </span>
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
                  <span className="text-sm text-gray-600">
                    {searchCount}/{tierLimits.maxSearches} searches used
                  </span>
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

        {/* Platform Stats Bar */}
        <PlatformStatsBar />

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="space-y-6">
            {/* Enhanced Search Input with Virtual Keyboard */}
            <EnhancedSearchBar
              onSearchComplete={onShowResults}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              userTier={user?.subscription_tier || 'free'}
              onSearchPerformed={onSearchPerformed}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
            />

            {/* Tier-specific upgrade messages */}
            {!user && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Sign up to get more searches and more results!</span> Anonymous users are limited to 9 results per search.
                    </p>
                    <button
                      onClick={onSignUp}
                      className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 underline"
                    >
                      Create free account →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {user && user.subscription_tier === 'free' && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Try Standard for more searches and increased results per platform every day!</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onPricing}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    Upgrade to Standard
                  </button>
                </div>
              </div>
            )}

            {user && user.subscription_tier === 'standard' && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Try Pro for unlimited searches and increased results per platform every day!</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onPricing}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              {/* Language Selector */}
              <div className="relative language-dropdown">
                <button
                  onClick={() => {
                    setShowLanguageDropdown(!showLanguageDropdown);
                    setShowTimeDropdown(false);
                    setShowPlatformDropdown(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>{currentLanguage?.flag} {currentLanguage?.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showLanguageDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          setSelectedLanguage(language.code);
                          setShowLanguageDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span>{language.flag}</span>
                        <span>{language.name}</span>
                        {selectedLanguage === language.code && <span className="ml-auto text-blue-600">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Time Filter */}
              <div className="relative time-dropdown">
                <button
                  onClick={() => {
                    setShowTimeDropdown(!showTimeDropdown);
                    setShowLanguageDropdown(false);
                    setShowPlatformDropdown(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{getTimeFilterLabel()}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTimeDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showTimeDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {timeFilters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => {
                          if (filter.value === 'custom') {
                            setShowCustomDatePicker(true);
                            setShowTimeDropdown(false);
                          } else {
                            setTimeFilter(filter.value);
                            setShowTimeDropdown(false);
                            setShowCustomDatePicker(false);
                          }
                        }}
                        className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span>{filter.label}</span>
                        {timeFilter === filter.value && <span className="text-blue-600">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Date Picker Modal */}
              {showCustomDatePicker && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Custom Date Range</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          max={customEndDate || new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          min={customStartDate}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => {
                          setShowCustomDatePicker(false);
                          setCustomStartDate('');
                          setCustomEndDate('');
                        }}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (customStartDate && customEndDate) {
                            setTimeFilter('custom');
                            setShowCustomDatePicker(false);
                          }
                        }}
                        disabled={!customStartDate || !customEndDate}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Platform Selector Dropdown */}
              <div className="relative platform-dropdown">
                <button
                  onClick={() => {
                    setShowPlatformDropdown(!showPlatformDropdown);
                    setShowLanguageDropdown(false);
                    setShowTimeDropdown(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">Platforms:</span>
                  <span className="text-sm text-gray-600">
                    {selectedPlatforms.length === 0 
                      ? 'None selected' 
                      : selectedPlatforms.length === platforms.length 
                      ? 'All platforms'
                      : `${selectedPlatforms.length} selected`}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showPlatformDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showPlatformDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2 px-2 py-1">
                        <span className="text-xs font-semibold text-gray-700 uppercase">Select Platforms</span>
                        {selectedPlatforms.length > 0 && selectedPlatforms.length < platforms.length && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlatforms(platforms.filter(p => p.available).map(p => p.id));
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Select All
                          </button>
                        )}
                      </div>
                      {platforms.map((platform) => {
                        const isSelected = selectedPlatforms.includes(platform.id);
                        return (
                          <label
                            key={platform.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-blue-50 hover:bg-blue-100' 
                                : 'hover:bg-gray-50'
                            } ${!platform.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handlePlatformToggle(platform.id)}
                              disabled={!platform.available}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <div className="relative w-5 h-5 flex-shrink-0">
                              <img 
                                src={platform.logo} 
                                alt={platform.name}
                                className="w-5 h-5 object-contain"
                                onError={(e) => {
                                  // Fallback: Replace with colored background
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = document.createElement('div');
                                  fallback.className = `w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold ${
                                    platform.id === 'reddit' ? 'bg-orange-500' :
                                    platform.id === 'x' ? 'bg-black' :
                                    platform.id === 'youtube' ? 'bg-red-600' :
                                    platform.id === 'linkedin' ? 'bg-blue-600' :
                                    'bg-gray-800'
                                  }`;
                                  fallback.textContent = platform.id === 'reddit' ? 'R' :
                                    platform.id === 'x' ? 'X' :
                                    platform.id === 'youtube' ? 'YT' :
                                    platform.id === 'linkedin' ? 'in' : 'T';
                                  target.parentElement?.appendChild(fallback);
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-700 flex-1">{platform.name}</span>
                            {isSelected && (
                              <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State - Only show when actually analyzing/segregating (not during focus generation) */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="text-center">
              <Loader className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-900 font-medium text-lg">Analyzing social media posts...</p>
              <p className="text-sm text-gray-500 mt-2">Analyzing posts, segregating by category, and preparing insights</p>
              <div className="mt-4 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Keyword Suggestions */}
        {!isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Popular Keywords</h3>
              
              {/* Period Filter Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPopularKeywordsPeriod('day')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    popularKeywordsPeriod === 'day'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setPopularKeywordsPeriod('week')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    popularKeywordsPeriod === 'week'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setPopularKeywordsPeriod('month')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    popularKeywordsPeriod === 'month'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  This Month
                </button>
              </div>
            </div>

            {loadingPopularKeywords ? (
              <div className="flex justify-center items-center py-8">
                <Loader className="w-5 h-5 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600 text-sm">Loading popular keywords...</span>
              </div>
            ) : popularKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-3 justify-center">
                {popularKeywords.map((keyword) => (
                  <button
                    key={keyword.query}
                    onClick={() => {
                      setSearchQuery(keyword.query);
                      // Optional: Auto-focus the search input after setting the term
                      setTimeout(() => {
                        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                        if (searchInput) {
                          searchInput.focus();
                        }
                      }, 100);
                    }}
                    className="px-6 py-3 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 rounded-full text-sm font-medium transition-colors border hover:border-indigo-200 shadow-sm flex items-center gap-2"
                    title={`Searched ${keyword.count} time${keyword.count !== 1 ? 's' : ''}`}
                  >
                    {keyword.query}
                    {keyword.count > 0 && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {keyword.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No popular keywords found for this period.</p>
                <p className="text-sm mt-2">Try a different time period or start searching!</p>
              </div>
            )}
          </div>
        )}

        {/* How It Works Guide */}
        {!isLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">How InsightSnap Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Enter Your Keyword</h4>
              <p className="text-gray-600 text-sm">
                Type any topic or keyword you want to research. Our AI will search across Reddit, X (Twitter), and YouTube comments to find relevant discussions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Analyzes Content</h4>
              <p className="text-gray-600 text-sm">
                Our advanced AI processes thousands of posts and comments to identify patterns, trends, and audience sentiments around your topic.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Get Actionable Insights</h4>
              <p className="text-gray-600 text-sm">
                Receive organized insights including top pain points, trending discussions, and content ideas to help you create resonating content.
              </p>
            </div>
          </div>

          {/* Arrow indicators for desktop */}
          <div className="hidden md:flex justify-center items-center mt-8 space-x-8">
            <div className="flex-1 border-t-2 border-dashed border-indigo-200"></div>
            <div className="text-indigo-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex-1 border-t-2 border-dashed border-indigo-200"></div>
            <div className="text-indigo-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex-1 border-t-2 border-dashed border-indigo-200"></div>
          </div>
        </div>
        )}

        {/* Error Message */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {results && !isLoading && (
          <div className="space-y-8">
            {renderResultSection(
              'Pain Points',
              <MessageSquare className="w-5 h-5" />,
              results.painPoints,
              'bg-red-600'
            )}
            
            {renderResultSection(
              'Trending Ideas',
              <Trending className="w-5 h-5" />,
              results.trendingIdeas,
              'bg-green-600'
            )}
            
            {renderResultSection(
              'Content Ideas',
              <Lightbulb className="w-5 h-5" />,
              results.contentIdeas,
              'bg-purple-600'
            )}
          </div>
        )}
      </main>

      {/* Virtual Keyboard */}
      {showKeyboard && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
            {/* Keyboard Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {currentKeyboardLanguage?.flag} {currentKeyboardLanguage?.name} Keyboard
                </span>
              </div>
              <div className="flex items-center gap-2">
                {virtualText && (
                  <button
                    onClick={transferToSearch}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Use Text
                  </button>
                )}
                <button
                  onClick={() => setShowKeyboard(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Virtual Text Display */}
            {virtualText && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-900">{virtualText}</p>
              </div>
            )}

            {/* Keyboard Layout */}
            <div className="space-y-2">
              {keyboardLayouts[keyboardLanguage as keyof typeof keyboardLayouts]?.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-1">
                  {row.map((key, keyIndex) => (
                    <button
                      key={keyIndex}
                      onClick={() => handleKeyboardInput(key)}
                      className="min-w-[40px] h-10 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium transition-colors"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              ))}
              
              {/* Special Keys Row */}
              <div className="flex justify-center gap-1 mt-3">
                <button
                  onClick={() => handleKeyboardInput('SPACE')}
                  className="px-8 h-10 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium transition-colors"
                >
                  <Space className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleKeyboardInput('DELETE')}
                  className="px-4 h-10 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium transition-colors"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Settings Button */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowKeyboardSettings(!showKeyboardSettings)}
            className="p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Keyboard className="w-5 h-5 text-gray-700" />
          </button>
          
          {showKeyboardSettings && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Keyboard Language</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        setKeyboardLanguage(language.code);
                        setShowKeyboard(language.code !== 'en');
                        setShowKeyboardSettings(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span>{language.flag}</span>
                      <span className="text-sm">{language.name}</span>
                      {keyboardLanguage === language.code && (
                        <span className="ml-auto text-blue-600 text-sm">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
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

export default ResearchDashboard;
