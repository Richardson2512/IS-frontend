import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthService } from '../services/authService';
import { NotificationService } from '../services/notificationService';

interface User {
  id: string;
  name: string;
  email: string;
  subscription_tier: 'free' | 'standard' | 'pro';
  search_count: number;
}

interface AuthCallbackProps {
  onAuthComplete: (user: User) => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onAuthComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Starting auth callback process');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        
        // First, check if user is already authenticated
        console.log('🔍 Checking for existing session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionData?.session?.user && !sessionError) {
          console.log('✅ User already authenticated:', sessionData.session.user.email);
          
          // User is already signed in, proceed with profile fetch
          try {
            const { user: authUser, profile } = await AuthService.getCurrentUser();
            
            if (authUser && profile) {
              console.log('✅ Profile found, completing authentication');
              onAuthComplete({
                id: authUser.id,
                name: profile.name,
                email: profile.email,
                subscription_tier: (profile.subscription_tier || 'free') as 'free' | 'standard' | 'pro',
                search_count: profile.search_count || 0
              });
              return;
            } else {
              // Create basic user data from session
              console.log('⚠️ No profile found, using session data');
              onAuthComplete({
                id: sessionData.session.user.id,
                name: sessionData.session.user.user_metadata?.name || sessionData.session.user.email?.split('@')[0] || 'User',
                email: sessionData.session.user.email || '',
                subscription_tier: 'free' as const,
                search_count: 0
              });
              return;
            }
          } catch (profileError) {
            console.warn('⚠️ Profile fetch failed, using session data:', profileError);
            onAuthComplete({
              id: sessionData.session.user.id,
              name: sessionData.session.user.user_metadata?.name || sessionData.session.user.email?.split('@')[0] || 'User',
              email: sessionData.session.user.email || '',
              subscription_tier: 'free' as const,
              search_count: 0
            });
            return;
          }
        }
        
        // Check if we have tokens in the URL hash
        const hash = window.location.hash;
        console.log('🔍 Checking URL hash:', hash);
        
        if (!hash || !hash.includes('access_token')) {
          console.error('No access token found in URL hash and no existing session');
          setError('Invalid authentication link. Please try signing in again.');
          return;
        }
        
        // Extract access token from URL hash immediately
        console.log('🔍 Extracting access token from URL...');
        const urlParams = new URLSearchParams(hash.substring(1));
        const accessToken = urlParams.get('access_token');
        const tokenType = urlParams.get('token_type');
        const expiresAt = urlParams.get('expires_at');
        
        console.log('🔍 Token details:', {
          hasAccessToken: !!accessToken,
          tokenType,
          expiresAt,
          tokenLength: accessToken?.length
        });
        
        if (accessToken) {
          try {
            // Instead of manually decoding JWT, wait for Supabase to process the token
            console.log('🔍 Access token found, waiting for Supabase to process...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get session data from Supabase (safer than manual JWT decoding)
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionData?.session?.user && !sessionError) {
              const user = sessionData.session.user;
              const userData = {
                id: user.id,
                name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                subscription_tier: user.user_metadata?.subscription_tier || 'free' as const,
                search_count: 0
              };
              
              console.log('✅ User data extracted via Supabase session:', userData);
              
              // Send admin notification for Google signup (don't block auth flow)
              NotificationService.notifyNewSignup({
                email: userData.email,
                name: userData.name,
                subscription_tier: 'free',
                signup_method: 'google'
              }).catch(err => console.error('Failed to send signup notification:', err));
              
              console.log('🚀 Calling onAuthComplete...');
              onAuthComplete(userData);
              return;
            }
          } catch (tokenError) {
            console.error('Failed to get session from Supabase:', tokenError);
            // Continue to fallback method
          }
        }
        
        // Fallback: Wait a moment for Supabase to process the tokens
        console.log('⏳ Waiting for Supabase to process tokens...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to get the session after tokens are processed
        console.log('🔍 Attempting to get session from Supabase...');
        const { data: fallbackSessionData, error: fallbackSessionError } = await supabase.auth.getSession();
        
        console.log('AuthCallback: Session data:', fallbackSessionData);
        console.log('AuthCallback: Session error:', fallbackSessionError);
        
        // If session retrieval also failed, show error
        if (fallbackSessionError || !fallbackSessionData?.session?.user) {
          console.error('❌ Both token extraction and session retrieval failed');
          setError('Authentication failed. Please try signing in again.');
          return;
        }

        if (fallbackSessionData.session?.user) {
          console.log('✅ User session found:', fallbackSessionData.session.user.email);
          
          // Create basic user data for completion
          const userData = {
            id: fallbackSessionData.session.user.id,
            name: fallbackSessionData.session.user.user_metadata?.name || fallbackSessionData.session.user.email?.split('@')[0] || 'User',
            email: fallbackSessionData.session.user.email || '',
            subscription_tier: 'free' as const,
            search_count: 0
          };
          
          // Try to get/create profile, but don't let it block completion
          try {
            console.log('🔍 Attempting to get/create user profile...');
            const { user: authUser, profile } = await AuthService.getCurrentUser();
            
            if (authUser && profile) {
              console.log('✅ Profile found, using profile data');
              onAuthComplete({
                id: authUser.id,
                name: profile.name,
                email: profile.email,
                subscription_tier: (profile.subscription_tier || 'free') as 'free' | 'standard' | 'pro',
                search_count: profile.search_count || 0
              });
            } else {
              console.log('⚠️ No profile found, using basic user data');
              onAuthComplete(userData);
            }
          } catch (profileError) {
            console.warn('⚠️ Profile creation/retrieval failed, using basic user data:', profileError);
            onAuthComplete(userData);
          }
        } else {
          setError('No user session found. Please try signing in again.');
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // Add fallback timeout to ensure callback always completes
    const fallbackTimeout = setTimeout(() => {
      console.warn('⚠️ Auth callback taking too long, forcing completion...');
      setIsLoading(false);
      setError('Authentication is taking longer than expected. Please try refreshing the page.');
    }, 10000); // 10 second fallback

    handleAuthCallback().finally(() => {
      clearTimeout(fallbackTimeout);
    });
  }, [onAuthComplete]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-900 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
