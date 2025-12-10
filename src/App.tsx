import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
// import ResearchDashboard from './components/ResearchDashboard'; // Now handled by MultiStepSearchToggle
import { MultiStepSearchToggle } from './components/MultiStepSearchToggle';
import ResultsPage from './components/ResultsPage';
import AuthModal from './components/AuthModal';
import AuthCallback from './components/AuthCallback';
import SearchLimitModal from './components/SearchLimitModal';
import AdminPanel from './components/AdminPanel';
import ContactPage from './components/ContactPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import BlogPage from './components/BlogPage';
import BlogDetailPage from './components/BlogDetailPage';
import PaymentSuccessPage from './components/PaymentSuccessPage';
import PaymentCancelPage from './components/PaymentCancelPage';
import { AuthService } from './services/authService';
import { supabase } from './lib/supabase';
import { AnalyzedResults } from './services/apiConfig';
import { MetaPixelService } from './services/metaPixelService';

interface User {
  id: string;
  name: string;
  email: string;
  subscription_tier: 'free' | 'standard' | 'pro';
  search_count: number;
}

function App() {
  // Initialize view based on current URL
  const getInitialView = () => {
    const path = window.location.pathname;
    if (path === '/') return 'landing';
    const view = path.slice(1);
    if (['dashboard', 'results', 'contact', 'privacy', 'terms', 'blog', 'payment-success', 'payment-cancel'].includes(view)) {
      return view as 'dashboard' | 'results' | 'contact' | 'privacy' | 'terms' | 'blog' | 'payment-success' | 'payment-cancel';
    }
    // Check if it's a blog post (starts with 'blog/')
    if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '');
      setCurrentBlogSlug(slug);
      return 'blog-post';
    }
    return 'landing';
  };

  // Check if we have a stored view in sessionStorage first
  const getStoredOrInitialView = () => {
    const storedView = sessionStorage.getItem('currentView');
    if (storedView && ['landing', 'dashboard', 'results', 'contact', 'privacy', 'terms', 'blog', 'blog-post', 'auth-callback', 'payment-success', 'payment-cancel'].includes(storedView)) {
      console.log('✅ Restored view from session storage:', storedView);
      return storedView as 'landing' | 'dashboard' | 'results' | 'contact' | 'privacy' | 'terms' | 'blog' | 'blog-post' | 'auth-callback' | 'payment-success' | 'payment-cancel';
    }
    return getInitialView();
  };

  // Restore results immediately on initialization (synchronous)
  const getStoredResults = (): AnalyzedResults | null => {
    const storedResults = sessionStorage.getItem('currentResults');
    const storedView = sessionStorage.getItem('currentView');
    
    if (storedResults && storedView === 'results') {
      try {
        const parsed = JSON.parse(storedResults);
        console.log('✅ Restored results synchronously from session storage');
        return parsed;
      } catch (error) {
        console.error('Failed to parse stored results:', error);
        return null;
      }
    }
    return null;
  };

  const getStoredQuery = (): string => {
    const storedView = sessionStorage.getItem('currentView');
    if (storedView === 'results') {
      return sessionStorage.getItem('currentSearchQuery') || '';
    }
    return '';
  };

  // Restore user from sessionStorage
  const getStoredUser = (): User | null => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        console.log('✅ Restored user from session storage:', parsed.email);
        return parsed;
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        return null;
      }
    }
    return null;
  };

  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'results' | 'contact' | 'privacy' | 'terms' | 'blog' | 'blog-post' | 'auth-callback' | 'payment-success' | 'payment-cancel'>(getStoredOrInitialView());
  const [currentBlogSlug, setCurrentBlogSlug] = useState<string>('');
  const [navigationHistory, setNavigationHistory] = useState<string[]>([getStoredOrInitialView()]);
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isRestoringState, setIsRestoringState] = useState(false);
  const [searchLimitModalOpen, setSearchLimitModalOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resetAuthLoading, setResetAuthLoading] = useState(false);

  // Results state - restore from sessionStorage if available
  const [currentResults, setCurrentResults] = useState<AnalyzedResults | null>(getStoredResults());
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>(getStoredQuery());
  const [currentNoResultsMessage, setCurrentNoResultsMessage] = useState<{
    title: string;
    message: string;
    reasons: string[];
    suggestions: string[];
    tip: string;
  } | null>(null);
  

  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 App initializing...');
        
        // Check if we have stored state - if auth-callback view, don't skip initialization
        const storedView = sessionStorage.getItem('currentView');
        const storedUser = sessionStorage.getItem('currentUser');
        const hasStoredResults = sessionStorage.getItem('currentResults');
        
        // If we have stored state AND it's not an auth callback, preserve it
        if (storedView && storedView !== 'auth-callback' && (storedUser || hasStoredResults)) {
          console.log('⚠️ Stored state detected - skipping initialization to preserve state');
          console.log('📦 Preserved view:', storedView);
          console.log('👤 Preserved user:', storedUser ? 'Yes' : 'No');
          console.log('📊 Preserved results:', hasStoredResults ? 'Yes' : 'No');
          setIsRestoringState(true);
          setIsLoading(false);
          return; // Skip initialization completely
        }
        
        // Check environment variables
        console.log('🔍 Environment variables check:', {
          hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
          hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          hasBackendUrl: !!import.meta.env.VITE_BACKEND_URL,
          hasMetaPixelId: !!import.meta.env.VITE_META_PIXEL_ID
        });
        
        // Initialize Meta Pixel if configured
        const metaPixelId = import.meta.env.VITE_META_PIXEL_ID;
        if (metaPixelId) {
          MetaPixelService.initialize(metaPixelId);
          console.log('📊 Meta Pixel initialized');
        } else {
          console.warn('⚠️ Meta Pixel ID not configured');
        }
        
        // Track app initialization
        console.log('📊 App initialization tracked');
        
        // Test database connection
        try {
          const dbTest = await AuthService.testDatabaseConnection();
          if (!dbTest.success) {
            console.error('❌ Database connection failed during app initialization');
          }
        } catch (error) {
          console.warn('Database connection test error:', error);
        }
        
        // Check if this is an auth callback URL
        const path = window.location.pathname;
        const hash = window.location.hash;
        const currentUrl = window.location.href;
        
        // Check for auth callback conditions
        const isAuthCallback = (
          path === '/auth/callback' || 
          hash.includes('access_token') || 
          hash.includes('refresh_token') ||
          hash.includes('type=signup')
        );
        
        console.log('🔍 Auth callback check:', {
          path,
          hash,
          isAuthCallback,
          hasAccessToken: hash.includes('access_token'),
          hasRefreshToken: hash.includes('refresh_token'),
          hasTypeSignup: hash.includes('type=signup')
        });
        
        if (isAuthCallback) {
          console.log('🔄 Auth callback detected - switching to auth-callback view');
          console.log('📊 Auth callback tracked');
          setCurrentView('auth-callback');
          setIsLoading(false);
          return;
        }

        // Check for existing session
        try {
          console.log('🔍 Checking for existing session...');
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout')), 5000)
          );
          
          const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
          
          if (session?.user) {
            console.log('✅ Found existing session for:', session.user.email);
            
            // Track returning user
            console.log('📊 Returning user tracked');
            
            // Get user profile with timeout
            try {
              const profilePromise = AuthService.getCurrentUser() as Promise<{ user: any; profile: any }>;
              const profileTimeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
              );
              
              const { user: authUser, profile } = await Promise.race([
                profilePromise,
                profileTimeoutPromise
              ]) as { user: any; profile: any };
              
              if (authUser) {
                const userData = {
                  id: authUser.id,
                  name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                  email: profile?.email || authUser.email || '',
                  subscription_tier: profile?.subscription_tier || 'free' as const,
                  search_count: profile?.search_count || 0
                };
                
                setUser(userData);
                console.log('✅ User set from existing session:', userData.email);
                
                // Track user tier
                console.log('📊 User tier tracked:', userData.subscription_tier);
              }
            } catch (profileError) {
              console.warn('⚠️ Profile fetch failed, using basic user data:', profileError);
              const basicUserData = {
                id: session.user.id,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                subscription_tier: 'free' as const,
                search_count: 0
              };
              setUser(basicUserData);
            }
          } else {
            console.log('ℹ️ No existing session found');
            console.log('📊 Landing page first visit tracked');
          }
        } catch (sessionError) {
          console.warn('⚠️ Session check failed:', sessionError);
          // Continue without session - user can still use the app
          console.log('📊 Landing page first visit tracked');
        }
        
      } catch (error) {
        console.error('❌ App initialization error:', error);
        console.log('📊 App initialization error tracked');
      } finally {
        setIsLoading(false);
        console.log('✅ App initialization complete');
      }
    };

    // Add a fallback timeout to ensure app always loads
    const fallbackTimeout = setTimeout(() => {
      console.warn('⚠️ App initialization taking too long, forcing completion...');
      setIsLoading(false);
    }, 5000); // 5 second fallback

    initializeApp().finally(() => {
      clearTimeout(fallbackTimeout);
    });
  }, []); // Empty dependency array - only run once

  // Listen for auth state changes
  useEffect(() => {
    console.log('👂 Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event, session?.user?.email || 'no user');
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          console.log('🔐 User signed in, fetching profile...');
          
          // Don't close modal if we're showing email verification
          if (showEmailVerification) {
            console.log('📧 Email verification screen is showing, keeping modal open');
            return;
          }
          
          // Check if user is already set to prevent duplicate processing
          // Use a flag to check if we're already processing this user
          const processingKey = `processing_auth_${session.user.id}`;
          if (sessionStorage.getItem(processingKey)) {
            console.log('✅ Already processing this user, skipping duplicate');
            return;
          }
          sessionStorage.setItem(processingKey, 'true');
          
          // Check if we have stored user data to preserve tier and search count
          const storedUser = sessionStorage.getItem('currentUser');
          let subscriptionTier: 'free' | 'standard' | 'pro' = 'free';
          let searchCount = 0;
          
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              subscriptionTier = parsed.subscription_tier || 'free';
              searchCount = parsed.search_count || 0;
              console.log('✅ Preserving tier from session:', subscriptionTier);
            } catch (error) {
              console.error('Failed to parse stored user:', error);
            }
          } else {
            // Check localStorage for subscription tier
            subscriptionTier = await AuthService.getSubscriptionTier(session.user.id);
            searchCount = await AuthService.getSearchCount(session.user.id);
          }
          
          // Create user data preserving tier and search count
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            subscription_tier: subscriptionTier,
            search_count: searchCount
          };
          
          setUser(userData);
          console.log('✅ User set:', userData.email, 'Tier:', userData.subscription_tier);
          
          // Clear processing flag
          sessionStorage.removeItem(processingKey);
          
          // Only navigate to dashboard if this is a NEW sign-in (not restoring existing session)
          // Check if we have a stored view - if so, preserve it
          const storedView = sessionStorage.getItem('currentView');
          
          // Don't redirect if we're restoring state from session storage
          if (isRestoringState) {
            console.log('📍 Restoring state - preventing redirect, keeping current view:', currentView);
            setAuthModalOpen(false);
            return;
          }
          
          if (!storedView || storedView === 'landing' || storedView === 'auth-callback') {
            // New sign-in - navigate to dashboard
            setAuthModalOpen(false);
            setCurrentView('dashboard');
            setNavigationHistory(['landing', 'dashboard']);
            console.log('📍 New sign-in - navigating to dashboard');
          } else {
            // Existing session being restored - keep current view
            console.log('📍 Existing session - preserving current view:', storedView);
            setAuthModalOpen(false);
          }
          
          // Reset loading state in modal
          setResetAuthLoading(true);
          setTimeout(() => setResetAuthLoading(false), 100);
          
          // Track successful login
          console.log('📊 Login tracked');
        } catch (error) {
          console.error('❌ Error in auth state change:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        // Clear all processing flags
        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith('processing_auth_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
        console.log('👋 User signed out');
        console.log('📊 User signed out tracked');
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth listener...');
      subscription?.unsubscribe();
    };
  }, [showEmailVerification]); // Only include showEmailVerification in dependencies

  // Sync URL with stored view on mount and reset restoring state flag
  useEffect(() => {
    const storedView = sessionStorage.getItem('currentView');
    
    // If we have a stored view, make sure the URL is synced
    if (storedView && currentView === storedView) {
      const path = storedView === 'landing' ? '/' : `/${storedView}`;
      if (window.location.pathname !== path) {
        window.history.replaceState({ view: storedView }, '', path);
        console.log('🔄 Synced URL with stored view:', path);
      }
    }
    
    // Reset the restoring state flag after a short delay to allow auth listener to complete
    if (isRestoringState) {
      const timer = setTimeout(() => {
        setIsRestoringState(false);
        console.log('🔄 Reset restoring state flag');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []); // Only run once on mount

  // Persist results to sessionStorage whenever they change
  useEffect(() => {
    if (currentResults && currentSearchQuery) {
      sessionStorage.setItem('currentResults', JSON.stringify(currentResults));
      sessionStorage.setItem('currentSearchQuery', currentSearchQuery);
      console.log('💾 Results saved to session storage');
    }
  }, [currentResults, currentSearchQuery]);

  // Persist currentView to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('currentView', currentView);
    console.log('💾 Current view saved to session storage:', currentView);
  }, [currentView]);

  // Persist user data to sessionStorage whenever it changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      console.log('💾 User saved to session storage:', user.email, 'Tier:', user.subscription_tier);
    } else {
      sessionStorage.removeItem('currentUser');
      console.log('🧹 User cleared from session storage');
    }
  }, [user]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      
      // Handle blog post URLs
      if (path.startsWith('/blog/')) {
        const slug = path.replace('/blog/', '');
        setCurrentBlogSlug(slug);
        setCurrentView('blog-post');
        setNavigationHistory(prev => [...prev, 'blog-post']);
        return;
      }
      
      const view = path === '/' ? 'landing' : path.slice(1) as 'dashboard' | 'results' | 'contact' | 'privacy' | 'terms' | 'blog' | 'payment-success' | 'payment-cancel';
      
      if (['landing', 'dashboard', 'results', 'contact', 'privacy', 'terms', 'blog', 'payment-success', 'payment-cancel'].includes(view)) {
        setCurrentView(view);
        setNavigationHistory(prev => [...prev, view]);
        
        // If navigating to results, restore from sessionStorage
        if (view === 'results') {
          const storedResults = sessionStorage.getItem('currentResults');
          const storedQuery = sessionStorage.getItem('currentSearchQuery');
          
          if (storedResults && storedQuery) {
            try {
              setCurrentResults(JSON.parse(storedResults));
              setCurrentSearchQuery(storedQuery);
              console.log('✅ Restored results on navigation');
            } catch (error) {
              console.error('Failed to restore results on navigation:', error);
            }
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Admin Panel keyboard shortcut (Ctrl+Shift+A or Cmd+Shift+A)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        if (user) {
          console.log('🔧 Admin panel toggled');
          setAdminPanelOpen(prev => !prev);
        } else {
          console.log('⚠️ Admin panel requires login');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  // Navigation functions
  const navigateTo = (view: 'landing' | 'dashboard' | 'results' | 'contact' | 'privacy' | 'terms' | 'blog') => {
    const previousView = currentView;
    setNavigationHistory(prev => [...prev, view]);
    setCurrentView(view);
    
    // Update URL without hash
    const path = view === 'landing' ? '/' : `/${view}`;
    window.history.pushState({ view }, '', path);
    
    // Track page navigation
    console.log('📊 Page navigation tracked:', previousView, '->', view);
  };

  const handleGoBack = () => {
    // Clear results from sessionStorage when navigating back
    if (currentView === 'results') {
      sessionStorage.removeItem('currentResults');
      sessionStorage.removeItem('currentSearchQuery');
      console.log('🧹 Cleared results from session storage');
    }
    
    if (navigationHistory.length > 1) {
      const previousPage = navigationHistory[navigationHistory.length - 2];
      setNavigationHistory(prev => prev.slice(0, -1));
      setCurrentView(previousPage as 'landing' | 'dashboard' | 'results' | 'contact' | 'privacy');
      
      console.log('📊 Navigation back tracked');
    } else {
      setCurrentView('landing');
      console.log('📊 Landing page tracked');
    }
  };

  const handleGoHome = () => {
    // Clear sessionStorage when going home
    sessionStorage.removeItem('currentResults');
    sessionStorage.removeItem('currentSearchQuery');
    sessionStorage.removeItem('currentView');
    console.log('🧹 Cleared session storage');
    
    setCurrentView('landing');
    setNavigationHistory(['landing']);
    console.log('📊 Home navigation tracked');
  };

  const handleGetStarted = () => {
    navigateTo('dashboard');
    console.log('📊 Get started tracked');
  };

  const handleContact = () => {
    navigateTo('contact');
    console.log('📊 Contact page tracked');
  };

  const handlePrivacyPolicy = () => {
    navigateTo('privacy');
    console.log('📊 Privacy policy tracked');
  };

  const handleTermsAndConditions = () => {
    navigateTo('terms');
    console.log('📊 Terms and conditions tracked');
  };

  const handleBlog = () => {
    navigateTo('blog');
    console.log('📊 Blog page tracked');
  };

  const handleBlogPost = (slug: string) => {
    setCurrentBlogSlug(slug);
    setCurrentView('blog-post');
    setNavigationHistory(prev => [...prev, 'blog-post']);
    
    // Update URL for blog post
    window.history.pushState({ view: 'blog-post', slug }, '', `/blog/${slug}`);
    console.log('📊 Blog post navigation tracked:', slug);
  };

  const handlePricing = () => {
    if (currentView === 'landing') {
      // If already on landing page, just scroll to pricing section
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
        console.log('✅ Scrolled to pricing section');
      }
    } else {
      // If on different page, navigate to landing first with proper state update
      const previousView = currentView;
      setNavigationHistory(prev => [...prev, 'landing']);
      setCurrentView('landing');
      
      // Update URL to landing page (without hash to avoid invalid URL)
      window.history.pushState({ view: 'landing' }, '', '/');
      
      // Track navigation
      console.log('📊 Page navigation tracked:', previousView, '->', 'landing');
      
      // Wait for React to update the view and render the landing page
      // Use a more reliable approach with useEffect-like timing
      requestAnimationFrame(() => {
        setTimeout(() => {
          const attemptScroll = (attempts = 0) => {
            if (attempts > 20) {
              console.warn('⚠️ Failed to scroll to pricing section after multiple attempts');
              return;
            }
            
            const pricingSection = document.getElementById('pricing');
            if (pricingSection) {
              pricingSection.scrollIntoView({ behavior: 'smooth' });
              console.log('✅ Scrolled to pricing section after navigation');
              return;
            }
            
            // Try again after a short delay
            setTimeout(() => attemptScroll(attempts + 1), 100);
          };
          
          attemptScroll();
        }, 200);
      });
    }
    console.log('📊 Pricing navigation tracked');
  };

  const handleLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
    setAuthError(null);
    console.log('📊 Login modal tracked');
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
    setAuthError(null);
    console.log('📊 Signup modal tracked');
  };

  const handleSearchResults = (results: AnalyzedResults, query: string, noResultsMessage?: {
    title: string;
    message: string;
    reasons: string[];
    suggestions: string[];
    tip: string;
  }) => {
    setCurrentResults(results);
    setCurrentSearchQuery(query);
    setCurrentNoResultsMessage(noResultsMessage || null);
    navigateTo('results');
    
    // Track successful search
    console.log('📊 Search tracked:', query);
    
    // Track results metrics
    const totalResults = (results.painPoints?.length || 0) + 
                        (results.trendingIdeas?.length || 0) + 
                        (results.contentIdeas?.length || 0);
    
    console.log('📊 Search completed tracked:', {
      query,
      total_results: totalResults,
      pain_points: results.painPoints?.length || 0,
      trending_ideas: results.trendingIdeas?.length || 0,
      content_ideas: results.contentIdeas?.length || 0
    });
  };

  const handleAuth = async (email: string, password: string, name?: string) => {
    try {
      setAuthError(null);
      console.log('🔐 Starting authentication:', { mode: authMode, email });
      
      // Check if user is already signed in
      const { user: currentUser } = await AuthService.getCurrentUser();
      if (currentUser && currentUser.email === email) {
        console.log('✅ User is already signed in, closing modal');
        
        // Preserve tier and search count
        const tier = await AuthService.getSubscriptionTier(currentUser.id);
        const searchCount = await AuthService.getSearchCount(currentUser.id);
        
        setUser({
          id: currentUser.id,
          name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email || '',
          subscription_tier: tier,
          search_count: searchCount
        });
        setAuthModalOpen(false);
        
        // Only navigate to dashboard if we're on landing page, otherwise preserve current view
        const storedView = sessionStorage.getItem('currentView');
        if (!storedView || storedView === 'landing') {
          setCurrentView('dashboard');
          setNavigationHistory(['landing', 'dashboard']);
          console.log('📍 Navigating to dashboard');
        } else {
          console.log('📍 Preserving current view:', storedView);
        }
        
        // Reset loading state in modal
        setResetAuthLoading(true);
        setTimeout(() => setResetAuthLoading(false), 100);
        
        console.log('📊 Login tracked');
        return;
      }

      if (authMode === 'signup') {
        console.log('🔑 Attempting sign up...');
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || email.split('@')[0] }
          }
        });

        if (error) {
          const errorMessage = error.message.includes('already registered') 
            ? 'An account with this email already exists. Please sign in instead.'
            : error.message;
          console.error('❌ Sign up error:', errorMessage);
          setAuthError(errorMessage);
          console.log('📊 Sign up error tracked:', errorMessage);
          return;
        }
        console.log('✅ Sign up successful');
        console.log('📊 Sign up tracked');
        
        // Show email verification screen instead of closing modal
        setShowEmailVerification(true);
        setVerificationEmail(email);
        setResetAuthLoading(true);
        setTimeout(() => setResetAuthLoading(false), 100);
        return;
      } else {
        console.log('🔑 Attempting sign in...');
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          const errorMessage = error.message.includes('Invalid login credentials')
            ? 'Invalid email or password. Please check your credentials and try again.'
            : error.message;
          console.error('❌ Sign in error:', errorMessage);
          setAuthError(errorMessage);
          console.log('📊 Sign in error tracked:', errorMessage);
          // Clear any email verification state on sign in error
          setShowEmailVerification(false);
          setResetAuthLoading(true);
          setTimeout(() => setResetAuthLoading(false), 100);
          return;
        }
        console.log('✅ Sign in successful');
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      setAuthError('An unexpected error occurred');
      console.log('📊 Authentication error tracked');
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setCurrentView('landing');
      setNavigationHistory(['landing']);
      
      // Track sign out
      console.log('📊 User signed out tracked');
      
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  const handleToggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    setAuthError(null);
    console.log('📊 Auth mode switched tracked');
  };

  const handleSearchLimitReached = () => {
    setSearchLimitModalOpen(true);
    console.log('📊 Search limit reached tracked');
  };

  const handleSearchCountUpdate = async (increment: number = 1) => {
    if (user) {
      // For logged-in users, use the AuthService with daily reset logic
      try {
        console.log(`📊 Updating search count for user ${user.id}, increment: ${increment}`);
        const { data, error } = await AuthService.updateSearchCount(user.id, increment);
        
        if (error) {
          console.error('❌ Error updating search count:', error);
          return;
        }
        
        if (data && data.search_count !== undefined) {
          // Update local state
          setUser(prev => prev ? { ...prev, search_count: data.search_count } : null);
          
          // Also refresh from Supabase to ensure we have the latest
          const refreshedCount = await AuthService.getSearchCount(user.id);
          setUser(prev => prev ? { ...prev, search_count: refreshedCount } : null);
          
          console.log(`✅ Search count updated: ${data.search_count}`);
          console.log('📊 Dashboard usage tracked');
          console.log('📊 Search count updated tracked');
        } else {
          console.warn('⚠️ Update search count returned no data');
        }
      } catch (error) {
        console.error('❌ Error updating search count:', error);
      }
    } else {
      // For anonymous users, update localStorage (lifetime limit, no daily reset)
      const currentCount = parseInt(localStorage.getItem('anonymousSearchCount') || '0', 10);
      const newCount = currentCount + increment;
      localStorage.setItem('anonymousSearchCount', newCount.toString());
      
      console.log('📊 Dashboard usage tracked');
      console.log('📊 Anonymous search count updated tracked (lifetime: ' + newCount + '/5)');
    }
  };

  // Get current search count for display (handles both logged-in and anonymous users)
  const getSearchCount = () => {
    if (user) {
      return user.search_count;
    } else {
      // Anonymous users have lifetime limit
      return parseInt(localStorage.getItem('anonymousSearchCount') || '0', 10);
    }
  };

  const handleAuthComplete = async (userData?: User) => {
    console.log('🔐 handleAuthComplete called with userData:', userData?.email || 'no data');
    
    // If user data is provided, set it immediately
    if (userData) {
      console.log('✅ Setting user from callback:', userData.email);
      setUser(userData);
    } else {
      // Fallback: try to get current user from session
      try {
        const { user: authUser, profile } = await AuthService.getCurrentUser();
        if (authUser) {
          const finalUserData: User = {
            id: authUser.id,
            name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            email: profile?.email || authUser.email || '',
            subscription_tier: profile?.subscription_tier || 'free',
            search_count: profile?.search_count || 0
          };
          console.log('✅ Setting user from session:', finalUserData.email);
          setUser(finalUserData);
        }
      } catch (error) {
        console.error('Failed to get user from session:', error);
      }
    }
    
    // Only navigate to dashboard if we're on landing/auth pages, otherwise preserve view
    const storedView = sessionStorage.getItem('currentView');
    
    if (!storedView || storedView === 'landing' || storedView === 'auth-callback') {
      setCurrentView('dashboard');
      setNavigationHistory(['landing', 'dashboard']);
      console.log('📍 Auth complete - navigating to dashboard');
    } else {
      console.log('📍 Auth complete - preserving current view:', storedView);
    }
    
    setShowEmailVerification(false);
    setVerificationEmail('');
    console.log('📊 Auth completed tracked');
  };

  const handleTierUpdated = (tier: 'free' | 'standard' | 'pro') => {
    if (user) {
      setUser(prev => prev ? { ...prev, subscription_tier: tier } : null);
      console.log('✅ User tier updated to:', tier);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentView === 'auth-callback' ? (
        <AuthCallback onAuthComplete={handleAuthComplete} />
      ) : currentView === 'landing' ? (
        <LandingPage
          onGetStarted={handleGetStarted}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onContact={handleContact}
          onPrivacyPolicy={handlePrivacyPolicy}
          onTermsAndConditions={handleTermsAndConditions}
          onBlog={handleBlog}
          onPricing={handlePricing}
          user={user}
          onSignOut={handleSignOut}
        />
      ) : currentView === 'dashboard' ? (
        <MultiStepSearchToggle
          onHome={handleGoHome}
          onContact={handleContact}
          onBlog={handleBlog}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onShowResults={(results: any, query: string) => handleSearchResults(results, query)}
          onSearchLimitReached={handleSearchLimitReached}
          onSearchPerformed={handleSearchCountUpdate}
          onSignOut={handleSignOut}
          onPrivacyPolicy={handlePrivacyPolicy}
          onTermsAndConditions={handleTermsAndConditions}
          onPricing={handlePricing}
          user={user}
          searchCount={getSearchCount()}
        />
      ) : currentView === 'results' ? (
        currentResults ? (
          <ResultsPage
            searchQuery={currentSearchQuery}
            results={currentResults}
            noResultsMessage={currentNoResultsMessage || undefined}
            onBack={handleGoBack}
            onHome={handleGoHome}
            onContact={handleContact}
            onBlog={handleBlog}
            onLogin={handleLogin}
            onSignUp={handleSignUp}
            onPrivacyPolicy={handlePrivacyPolicy}
            onTermsAndConditions={handleTermsAndConditions}
            user={user}
            onSignOut={handleSignOut}
          />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading results...</p>
            </div>
          </div>
        )
      ) : currentView === 'contact' ? (
        <ContactPage
          onHome={handleGoHome}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onContact={handleContact}
          onPrivacyPolicy={handlePrivacyPolicy}
          onTermsAndConditions={handleTermsAndConditions}
          onBlog={handleBlog}
          user={user}
          onSignOut={handleSignOut}
          onPricing={handlePricing}
        />
      ) : currentView === 'privacy' ? (
        <PrivacyPolicy
          onBack={handleGoBack}
          onHome={handleGoHome}
          onContact={handleContact}
          onBlog={handleBlog}
          onTermsAndConditions={handleTermsAndConditions}
          user={user}
          onSignOut={handleSignOut}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
        />
      ) : currentView === 'terms' ? (
        <TermsAndConditions
          onHome={handleGoHome}
          onContact={handleContact}
          onBlog={handleBlog}
          onPrivacyPolicy={handlePrivacyPolicy}
          onTermsAndConditions={handleTermsAndConditions}
          user={user}
          onSignOut={handleSignOut}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
        />
      ) : currentView === 'blog' ? (
        <BlogPage
          onHome={handleGoHome}
          onContact={handleContact}
          onBlog={handleBlog}
          onPrivacyPolicy={handlePrivacyPolicy}
          onTermsAndConditions={handleTermsAndConditions}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onBlogPost={handleBlogPost}
          user={user}
          onSignOut={handleSignOut}
        />
      ) : currentView === 'blog-post' ? (
        <BlogDetailPage
          slug={currentBlogSlug}
          onBack={() => navigateTo('blog')}
          onHome={handleGoHome}
          onContact={handleContact}
          onBlog={handleBlog}
          onPrivacyPolicy={handlePrivacyPolicy}
          onTermsAndConditions={handleTermsAndConditions}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          user={user}
          onSignOut={handleSignOut}
        />
      ) : currentView === 'payment-success' ? (
        <PaymentSuccessPage
          onGoToDashboard={() => navigateTo('dashboard')}
          onGoHome={() => navigateTo('landing')}
          userId={user?.id || ''}
        />
      ) : currentView === 'payment-cancel' ? (
        <PaymentCancelPage
          onGoBack={() => navigateTo('landing')}
          onGoHome={() => navigateTo('landing')}
          onContactSupport={handleContact}
        />
      ) : null}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthError(null);
          setShowEmailVerification(false);
          setVerificationEmail('');
          console.log('📊 Auth modal closed tracked');
        }}
        mode={authMode}
        onAuth={handleAuth}
        onSwitchMode={handleToggleAuthMode}
        error={authError}
        resetLoading={resetAuthLoading}
        showEmailVerification={showEmailVerification}
        verificationEmail={verificationEmail}
      />

      <SearchLimitModal
        isOpen={searchLimitModalOpen}
        onClose={() => {
          setSearchLimitModalOpen(false);
          console.log('📊 Search limit modal closed tracked');
        }}
        onSignUp={handleSignUp}
        userTier={user?.subscription_tier || 'free'}
        searchCount={getSearchCount()}
        isLoggedIn={!!user}
      />

      {adminPanelOpen && user && (
        <AdminPanel
          user={user}
          onClose={() => setAdminPanelOpen(false)}
          onTierUpdated={handleTierUpdated}
        />
      )}
    </>
  );
}

export default App;
