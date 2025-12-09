import { API_CONFIG } from './apiConfig';

export class NotificationService {
  private static readonly BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://backend-production-be5d.up.railway.app/api';

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

      // Handle both URL formats: with /api or without
      const notificationsUrl = this.BACKEND_URL.endsWith('/api')
        ? `${this.BACKEND_URL}/notifications/signup`
        : `${this.BACKEND_URL}/api/notifications/signup`;
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
      const testUrl = this.BACKEND_URL.endsWith('/api')
        ? `${this.BACKEND_URL}/notifications/test`
        : `${this.BACKEND_URL}/api/notifications/test`;
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
      const healthUrl = this.BACKEND_URL.endsWith('/api')
        ? `${this.BACKEND_URL}/notifications/health`
        : `${this.BACKEND_URL}/api/notifications/health`;
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

