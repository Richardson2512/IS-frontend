import { API_CONFIG, getBackendApiUrl } from './apiConfig';

export class NotificationService {
  private static readonly BACKEND_URL = (() => {
    const url = import.meta.env.VITE_BACKEND_URL;
    if (!url) {
      throw new Error('VITE_BACKEND_URL environment variable is not set. Please configure it in your .env file.');
    }
    return url;
  })();

  /**
   * Send new signup notification to admin
   */
  static async notifyNewSignup(userData: {
    email: string;
    name?: string;
    subscription_tier?: 'free' | 'standard' | 'pro';
    signup_method?: 'email' | 'google';
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      console.log('📧 Sending signup notification for:', userData.email);

      // Note: Notification endpoints are not implemented in backend yet
      // This will fail silently to not block signup flow
      try {
        const apiUrl = getBackendApiUrl(this.BACKEND_URL);
        const notificationsUrl = `${apiUrl}/notifications/signup`;
        const response = await fetch(notificationsUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userData.email,
            name: userData.name || userData.email.split('@')[0],
            subscription_tier: userData.subscription_tier || 'free',
            signup_method: userData.signup_method || 'email'
          })
        });

        const result = await response.json();

        if (result.success) {
          console.log('✅ Signup notification sent successfully');
          return { success: true, message: 'Notification sent' };
        } else {
          console.warn('⚠️ Signup notification failed:', result.message);
          return { success: false, error: result.message };
        }
      } catch (urlError: any) {
        // If URL construction or fetch fails, just return success false without throwing
        console.warn('⚠️ Failed to send signup notification (service unavailable):', urlError.message);
        return { success: false, error: 'Notification service unavailable' };
      }
    } catch (error: any) {
      console.error('❌ Failed to send signup notification:', error);
      // Don't throw error - signup should succeed even if notification fails
      return { success: false, error: error.message };
    }
  }

  /**
   * Test notification service
   */
  static async testEmailService(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const apiUrl = getBackendApiUrl(this.BACKEND_URL);
      const testUrl = `${apiUrl}/notifications/test`;
      const response = await fetch(testUrl);
      const result = await response.json();
      
      return {
        success: result.success,
        message: result.message,
        error: result.error
      };

    } catch (error: any) {
      console.error('❌ Email service test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check notification service health
   */
  static async checkHealth(): Promise<{ configured: boolean; status: string; message?: string }> {
    try {
      const apiUrl = getBackendApiUrl(this.BACKEND_URL);
      const healthUrl = `${apiUrl}/notifications/health`;
      const response = await fetch(healthUrl);
      const result = await response.json();
      
      return {
        configured: result.configured,
        status: result.status,
        message: result.message
      };

    } catch (error: any) {
      console.error('❌ Notification service health check failed:', error);
      return {
        configured: false,
        status: 'ERROR',
        message: error.message
      };
    }
  }
}

