import { supabase } from '../lib/supabase'
import { NotificationService } from './notificationService'

export class AuthService {
  // Sign in with Google
  static async signInWithGoogle() {
    try {
      // Clear any stored state before OAuth to ensure clean slate
      sessionStorage.removeItem('currentView');
      sessionStorage.removeItem('currentUser');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { data: null, error }
    }
  }

  // Sign up with email and password
  static async signUp(email: string, password: string, name: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })

      if (error) throw error

      // Create user profile in your custom users table
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                name: name,
                subscription_tier: 'free',
                search_count: 0,
                last_reset_date: new Date().toISOString()
              }
            ])

          if (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't throw error, user can still verify email and sign in
            // Profile will be created when they first access the app
          } else {
            console.log('✅ User profile created successfully')
          }
        } catch (err) {
          console.error('Exception creating profile:', err)
          // Continue with signup process even if profile creation fails
        }

        // Send admin notification (don't block signup if this fails)
        // Defer to next tick to avoid blocking
        setTimeout(async () => {
        try {
          await NotificationService.notifyNewSignup({
            email: data.user.email || '',
            name: name,
            subscription_tier: 'free',
            signup_method: 'email'
            });
        } catch (notifError) {
            console.error('Failed to send signup notification:', notifError);
          // Don't throw - signup should succeed even if notification fails
        }
        }, 0);
      }

      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  }

  // Test database connection and auth system
  static async testDatabaseConnection() {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      // Test auth system instead of custom table
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Supabase connection test failed:', error);
        return { success: false, error };
      }
      
      console.log('✅ Supabase connection test successful');
      console.log('ℹ️ Current session status:', session ? 'Active' : 'No active session');
      return { success: true, data: { session } };
    } catch (err) {
      console.error('❌ Supabase connection test exception:', err);
      return { success: false, error: err };
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      console.log('🔍 getCurrentUser: Starting user fetch...');
      
      // First check if there's an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ getCurrentUser: Session error:', sessionError);
        return { user: null, profile: null }
      }
      
      if (!session || !session.user) {
        console.log('ℹ️ getCurrentUser: No active session');
        return { user: null, profile: null }
      }

      // Use the user from the session
      const user = session.user
      console.log('✅ getCurrentUser: Found user in session:', user.email);
      
      // Create profile data directly from auth user data
      // Since we don't have a custom users table, we'll use the auth user data
      // Use the getSearchCount method which automatically checks for daily resets
      const searchCount = await this.getSearchCount(user.id);
      const subscriptionTier = await this.getSubscriptionTier(user.id);
      
      const profile = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        subscription_tier: subscriptionTier,
        search_count: searchCount,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      };
      
      console.log('✅ getCurrentUser: Created profile from auth data:', profile);
      return { user, profile }
      
    } catch (error: any) {
      console.error('❌ getCurrentUser: Top-level error:', error);
      return { user: null, profile: null }
    }
  }

  // Update user search count with daily reset logic
  static async updateSearchCount(userId: string, increment: number = 1) {
    try {
      // First, get current count from Supabase (source of truth)
      let currentCount = 0;
      let lastResetDate: string | null = null;
      
      try {
        const { data: profile, error: fetchError } = await supabase
          .from('users')
          .select('search_count, last_reset_date')
          .eq('id', userId)
          .single();
        
        if (!fetchError && profile) {
          currentCount = profile.search_count || 0;
          lastResetDate = profile.last_reset_date;
        }
      } catch (fetchErr) {
        console.warn('⚠️ Could not fetch current search count from Supabase, using 0');
      }
      
      // Check if we need to reset the count
      // Get user tier to determine reset period
      const userTier = await this.getSubscriptionTier(userId);
      const isMonthly = userTier === 'free'; // Free users: monthly reset, others: daily reset
      const now = new Date();
      const shouldReset = this.shouldResetSearchCount(lastResetDate, isMonthly);
      
      // Reset count if period has passed
      if (shouldReset) {
        const resetPeriod = isMonthly ? 'month' : '24 hours';
        console.log(`🔄 Resetting search count for user ${userId} - ${resetPeriod} has passed`);
        currentCount = 0;
        lastResetDate = now.toISOString();
      }
      
      const newCount = currentCount + increment;
      
      // Update Supabase (database is source of truth)
      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update({
          search_count: newCount,
          last_reset_date: lastResetDate || now.toISOString()
        })
        .eq('id', userId)
        .select('search_count, last_reset_date')
        .single();
      
      if (updateError) {
        console.error('❌ Error updating search count in Supabase:', updateError);
        // Fallback to localStorage if Supabase fails
        const storageKey = `search_count_${userId}`;
        const lastResetKey = `last_reset_${userId}`;
        localStorage.setItem(storageKey, newCount.toString());
        localStorage.setItem(lastResetKey, lastResetDate || now.toISOString());
        
        return { data: { search_count: newCount }, error: updateError };
      }
      
      console.log(`✅ Updated search count in Supabase for user ${userId}: ${currentCount} -> ${newCount}`);
      
      return { data: { search_count: newCount }, error: null };
    } catch (error) {
      console.error('❌ Update search count error:', error);
      return { data: null, error };
    }
  }

  // Get current search count with automatic reset check
  static async getSearchCount(userId: string): Promise<number> {
    try {
      // First, try to get from Supabase (source of truth)
      const { data: profile, error } = await supabase
        .from('users')
        .select('search_count, last_reset_date')
        .eq('id', userId)
        .single();
      
      if (!error && profile) {
        const lastResetDate = profile.last_reset_date;
        // Get user tier to determine reset period
        const userTier = await this.getSubscriptionTier(userId);
        const isMonthly = userTier === 'free';
        const shouldReset = this.shouldResetSearchCount(lastResetDate, isMonthly);
        
        if (shouldReset && profile.search_count > 0) {
          // Reset count in Supabase if period has passed
          const resetPeriod = isMonthly ? 'month' : '24 hours';
          console.log(`🔄 Resetting search count for user ${userId} - ${resetPeriod} has passed`);
          const now = new Date();
          
          await supabase
            .from('users')
            .update({
              search_count: 0,
              last_reset_date: now.toISOString()
            })
            .eq('id', userId);
          
          return 0;
        }
        
        return profile.search_count || 0;
      }
      
      // Fallback to localStorage if Supabase fails
      console.warn('⚠️ Could not fetch search count from Supabase, using localStorage');
      const storageKey = `search_count_${userId}`;
      const lastResetKey = `last_reset_${userId}`;
      
      const lastResetDate = localStorage.getItem(lastResetKey);
      const shouldReset = this.shouldResetSearchCount(lastResetDate);
      
      if (shouldReset) {
        localStorage.setItem(storageKey, '0');
        localStorage.setItem(lastResetKey, new Date().toISOString());
        return 0;
      }
      
      return parseInt(localStorage.getItem(storageKey) || '0', 10);
    } catch (error) {
      console.error('❌ Get search count error:', error);
      // Final fallback
      const storageKey = `search_count_${userId}`;
      return parseInt(localStorage.getItem(storageKey) || '0', 10);
    }
  }

  // Helper function to check if 24 hours have passed since last reset
  private static shouldResetSearchCount(lastResetDate: string | null, isMonthly: boolean = false): boolean {
    if (!lastResetDate) return true;
    
    try {
      const lastReset = new Date(lastResetDate);
      const now = new Date();
      
      if (isMonthly) {
        // For monthly reset (free users): check if a month has passed
        const monthsSinceReset = (now.getFullYear() - lastReset.getFullYear()) * 12 + (now.getMonth() - lastReset.getMonth());
        return monthsSinceReset >= 1;
      } else {
        // For daily reset (standard users): check if 24 hours have passed
        const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
        return hoursSinceReset >= 24;
      }
    } catch (error) {
      console.error('Error checking reset time:', error);
      return true; // Reset on error to be safe
    }
  }

  // Update script generation count (lifetime tracking, no reset)
  static async updateScriptCount(userId: string | undefined, increment: number = 1) {
    try {
      // Use 'anonymous' as fallback for non-signed-in users
      const trackingId = userId || 'anonymous';
      const storageKey = `script_count_${trackingId}`;
      
      let currentCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
      const newCount = currentCount + increment;
      localStorage.setItem(storageKey, newCount.toString());
      
      console.log(`📊 Updated script count for user ${trackingId}: ${currentCount} -> ${newCount}`);
      
      return { data: { script_count: newCount }, error: null }
    } catch (error) {
      console.error('Update script count error:', error)
      return { data: null, error }
    }
  }

  // Get current script generation count (lifetime tracking)
  static async getScriptCount(userId: string | undefined): Promise<number> {
    try {
      // Use 'anonymous' as fallback for non-signed-in users
      const trackingId = userId || 'anonymous';
      const storageKey = `script_count_${trackingId}`;
      return parseInt(localStorage.getItem(storageKey) || '0', 10);
    } catch (error) {
      console.error('Get script count error:', error);
      return 0;
    }
  }

  // Note: Search history methods have been moved to SearchHistoryService
  // Use SearchHistoryService.trackSearch() and SearchHistoryService.getUserSearchHistory() instead

  // Check if user has reached search limit
  static async checkSearchLimit(userId: string, tier: 'free' | 'standard' | 'pro' = 'free', searchType: 'content' | 'ad' = 'content') {
    try {
      // Pro users have unlimited searches
      if (tier === 'pro') {
        return { 
          hasReachedLimit: false, 
          currentCount: 0, 
          limit: 999999,
          error: null 
        }
      }

      const limits = {
        free: 25, // 25 searches per month for content research only
        standard: 25 // 25 searches per day per feature (content research or ad intelligence)
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('search_count, last_reset_date')
        .eq('id', userId)
        .single()

      if (error) throw error

      // Check if we need to reset based on tier
      const isMonthly = tier === 'free';
      const shouldReset = this.shouldResetSearchCount(profile.last_reset_date, isMonthly);
      
      let currentCount = profile.search_count || 0;
      if (shouldReset) {
        currentCount = 0;
        // Reset in database
        await supabase
          .from('users')
          .update({ 
            search_count: 0,
            last_reset_date: new Date().toISOString()
          })
          .eq('id', userId);
      }

      const limit = limits[tier as keyof typeof limits] || 25;
      const hasReachedLimit = currentCount >= limit

      return { 
        hasReachedLimit, 
        currentCount, 
        limit,
        error: null 
      }
    } catch (error) {
      console.error('Check search limit error:', error)
      return { hasReachedLimit: false, currentCount: 0, limit: 0, error }
    }
  }

  // Update user subscription tier (Admin function)
  static async updateSubscriptionTier(userId: string, tier: 'free' | 'standard' | 'pro') {
    try {
      console.log(`🔧 Updating subscription tier for user ${userId} to ${tier}`);
      
      // Update user metadata in Supabase Auth
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { subscription_tier: tier }
      });

      if (error) {
        console.error('❌ Error updating subscription tier:', error);
        // If admin API fails, try updating via localStorage (fallback)
        localStorage.setItem(`subscription_tier_${userId}`, tier);
        console.log('✅ Subscription tier updated in localStorage (fallback)');
        return { success: true, data: { tier }, error: null };
      }

      console.log('✅ Subscription tier updated successfully');
      
      // Also update in localStorage for immediate effect
      localStorage.setItem(`subscription_tier_${userId}`, tier);
      
      return { success: true, data, error: null };
    } catch (error) {
      console.error('❌ Exception updating subscription tier:', error);
      // Fallback to localStorage
      localStorage.setItem(`subscription_tier_${userId}`, tier);
      return { success: true, data: { tier }, error: null };
    }
  }

  // Get user subscription tier
  static async getSubscriptionTier(userId: string): Promise<'free' | 'standard' | 'pro'> {
    try {
      // Check localStorage first for quick access
      const localTier = localStorage.getItem(`subscription_tier_${userId}`);
      if (localTier && ['free', 'standard', 'pro'].includes(localTier)) {
        return localTier as 'free' | 'standard' | 'pro';
      }

      // Check Supabase user metadata
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && session.user.id === userId) {
        const tier = session.user.user_metadata?.subscription_tier;
        if (tier && ['free', 'standard', 'pro'].includes(tier)) {
          // Cache in localStorage
          localStorage.setItem(`subscription_tier_${userId}`, tier);
          return tier as 'free' | 'standard' | 'pro';
        }
      }

      return 'free'; // Default
    } catch (error) {
      console.error('Error getting subscription tier:', error);
      return 'free';
    }
  }
}
