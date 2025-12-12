declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export interface MetaPixelEvent {
  eventName: string;
  parameters?: Record<string, any>;
  customData?: Record<string, any>;
}

export class MetaPixelService {
  private static pixelId: string = '';
  private static isInitialized: boolean = false;

  // Initialize Meta Pixel with your Pixel ID
  static initialize(pixelId: string): void {
    if (this.isInitialized) {
      console.warn('Meta Pixel already initialized');
      return;
    }

    this.pixelId = pixelId;
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('Meta Pixel: Not in browser environment');
      return;
    }

    try {
      // Initialize Facebook Pixel stub BEFORE loading the script
      const fbq = window.fbq = window.fbq || function() {
        (window.fbq.q = window.fbq.q || []).push(arguments);
      };
      
      if (!window._fbq) window._fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];

      // Initialize the pixel
      fbq('init', pixelId);
      
      // Track initial page view
      fbq('track', 'PageView');
      
      this.isInitialized = true;
      console.log('✅ Meta Pixel initialized with ID:', pixelId);

      // Load Meta Pixel script asynchronously (after stub is set up)
      this.loadMetaPixelScript(() => {
        console.log('📊 Meta Pixel script fully loaded and ready');
      });
      
    } catch (error) {
      console.error('❌ Error initializing Meta Pixel:', error);
    }
  }

  // Load Meta Pixel script dynamically
  private static loadMetaPixelScript(callback: () => void): void {
    // Check if script is already loaded
    if (document.querySelector('script[src*="fbevents.js"]')) {
      callback();
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    
    script.onload = () => {
      console.log('📊 Meta Pixel script loaded');
      callback();
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Meta Pixel script');
    };

    document.head.appendChild(script);
  }

  // Track standard events
  static trackEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.isInitialized || typeof window === 'undefined' || !window.fbq) {
      console.warn('Meta Pixel not initialized');
      return;
    }

    try {
      if (parameters) {
        window.fbq('track', eventName, parameters);
      } else {
        window.fbq('track', eventName);
      }
      console.log('📊 Meta Pixel event tracked:', eventName, parameters);
    } catch (error) {
      console.error('❌ Error tracking Meta Pixel event:', error);
    }
  }

  // Track custom events
  static trackCustomEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.isInitialized || typeof window === 'undefined' || !window.fbq) {
      console.warn('Meta Pixel not initialized');
      return;
    }

    try {
      if (parameters) {
        window.fbq('trackCustom', eventName, parameters);
      } else {
        window.fbq('trackCustom', eventName);
      }
      console.log('📊 Meta Pixel custom event tracked:', eventName, parameters);
    } catch (error) {
      console.error('❌ Error tracking Meta Pixel custom event:', error);
    }
  }

  // Page view tracking
  static trackPageView(pageName?: string): void {
    this.trackEvent('PageView', pageName ? { page_name: pageName } : undefined);
  }

  // Conversion tracking
  static trackSignUp(method?: string): void {
    this.trackEvent('CompleteRegistration', method ? { method } : undefined);
  }

  static trackLogin(method?: string): void {
    this.trackEvent('Login', method ? { method } : undefined);
  }

  static trackSearch(searchString: string, category?: string): void {
    this.trackEvent('Search', {
      search_string: searchString,
      content_category: category || 'research'
    });
  }

  static trackSubscription(tier: string, value?: number): void {
    this.trackEvent('Subscribe', {
      subscription_tier: tier,
      value: value || 0,
      currency: 'USD'
    });
  }

  static trackContentGeneration(contentType: string, category: string): void {
    this.trackCustomEvent('ContentGenerated', {
      content_type: contentType,
      category: category,
      timestamp: new Date().toISOString()
    });
  }

  static trackUpgradePrompt(currentTier: string, targetTier: string): void {
    this.trackCustomEvent('UpgradePromptShown', {
      current_tier: currentTier,
      target_tier: targetTier
    });
  }

  static trackDashboardUsage(feature: string): void {
    this.trackCustomEvent('FeatureUsed', {
      feature_name: feature,
      timestamp: new Date().toISOString()
    });
  }

  // Contact and engagement
  static trackContact(method: string): void {
    this.trackEvent('Contact', { method });
  }

  static trackEngagement(action: string, content?: string): void {
    this.trackCustomEvent('Engagement', {
      action,
      content: content || 'unknown',
      timestamp: new Date().toISOString()
    });
  }

  // Conversion funnel tracking
  static trackFunnelStep(step: string, stepNumber?: number): void {
    this.trackCustomEvent('FunnelStep', {
      step_name: step,
      step_number: stepNumber || 0,
      timestamp: new Date().toISOString()
    });
  }

  // Track user journey
  static trackUserJourney(fromPage: string, toPage: string): void {
    this.trackCustomEvent('PageNavigation', {
      from_page: fromPage,
      to_page: toPage,
      timestamp: new Date().toISOString()
    });
  }
}
