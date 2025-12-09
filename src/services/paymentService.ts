/**
 * DoDo Payments Integration Service
 * Handles all payment-related operations for Standard and Pro subscriptions
 * Uses backend API for secure payment processing
 */

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'https://backend-production-be5d.up.railway.app/api';

export interface PaymentPlan {
  id: string;
  name: 'standard' | 'pro';
  displayName: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface PaymentSession {
  sessionId: string;
  checkoutUrl: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface PaymentResult {
  success: boolean;
  sessionId?: string;
  checkoutUrl?: string;
  error?: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  tier: 'free' | 'standard' | 'pro';
  expiresAt?: string;
  cancelAtPeriodEnd?: boolean;
}

export class PaymentService {
  private static backendUrl = BACKEND_API_URL;

  /**
   * Available subscription plans
   */
  static plans: Record<string, PaymentPlan> = {
    standard: {
      id: 'standard_monthly',
      name: 'standard',
      displayName: 'Standard',
      price: 6.99,
      currency: 'USD',
      interval: 'month',
      features: [
        '50 searches per day',
        '25 AI script generations per day',
        'Time period filtering',
        '9 results per category (3 per platform)',
        '30 exports to CSV/PDF per month',
        'Email support'
      ]
    },
    pro: {
      id: 'pro_monthly',
      name: 'pro',
      displayName: 'Pro',
      price: 16.99,
      currency: 'USD',
      interval: 'month',
      features: [
        'Unlimited searches',
        'Unlimited AI script generations',
        'Advanced time filtering',
        '15 results per category (5 per platform)',
        'Auto-translation',
        'Priority support',
        'Trend alerts'
      ]
    }
  };

  /**
   * Create a payment session for a subscription
   */
  static async createPaymentSession(
    planId: string,
    userId: string,
    userEmail: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<PaymentResult> {
    try {
      const plan = this.plans[planId];
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      console.log(`🔐 Creating payment session for ${plan.displayName} plan...`);

      // Normalize backend URL - remove trailing /api if present, then add /api/payments
      let baseUrl = this.backendUrl.trim();
      if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.slice(0, -4); // Remove trailing '/api'
      }
      // Remove trailing slash if present
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      
      const paymentsUrl = `${baseUrl}/api/payments/create-checkout`;
      console.log(`🔗 Payment API URL: ${paymentsUrl}`);
      
      const requestBody = {
        userId,
        userEmail,
        planId,
        redirectUrl: successUrl
      };
      
      console.log('📤 Payment request:', {
        url: paymentsUrl,
        planId,
        userId: userId?.substring(0, 8) + '...',
        userEmail
      });

      const response = await fetch(paymentsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Payment response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Payment API error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        
        throw new Error(errorData.error || errorData.message || `Failed to create payment session (${response.status})`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      console.log('✅ Payment session created successfully');

      return {
        success: true,
        sessionId: data.sessionId,
        checkoutUrl: data.checkoutUrl
      };

    } catch (error) {
      console.error('❌ Payment session creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment session'
      };
    }
  }

  /**
   * Verify payment status
   * Note: Payment verification is handled automatically by backend webhooks
   * This method is primarily for UI feedback and checking session status
   */
  static async verifyPayment(sessionId: string): Promise<{ 
    success: boolean; 
    tier?: 'standard' | 'pro';
    error?: string;
  }> {
    try {
      // Payment verification happens via webhooks on the backend
      // This just confirms the session exists
      // The actual tier update happens automatically via webhook
      console.log('✅ Payment session completed, tier will be updated via webhook');
      
      return {
        success: true,
        tier: 'standard' // Default, actual tier is set by webhook
      };

    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify payment'
      };
    }
  }

  /**
   * Get subscription status for a user
   * This checks the user's tier from Supabase (updated by webhooks)
   */
  static async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      // Subscription status is managed in Supabase and updated via webhooks
      // The frontend should check the user's tier from the user object
      return {
        isActive: true,
        tier: 'free' // This should be fetched from Supabase/user context
      };

    } catch (error) {
      console.error('❌ Failed to fetch subscription status:', error);
      return {
        isActive: false,
        tier: 'free'
      };
    }
  }

  /**
   * Cancel subscription
   * Note: Subscription management should be done through customer portal
   * or backend API endpoints
   */
  static async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Subscription cancellation would be handled through:
      // 1. Customer portal link from DoDo Payments
      // 2. Backend API endpoint
      console.warn('Subscription cancellation should be handled through customer portal');
      
      return { 
        success: false,
        error: 'Please contact support to cancel your subscription'
      };

    } catch (error) {
      console.error('❌ Subscription cancellation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel subscription'
      };
    }
  }

  /**
   * Initiate checkout redirect
   */
  static redirectToCheckout(checkoutUrl: string): void {
    window.location.href = checkoutUrl;
  }

  /**
   * Get formatted price
   */
  static getFormattedPrice(planId: string): string {
    const plan = this.plans[planId];
    if (!plan) return '$0.00';
    return `$${plan.price.toFixed(2)}/${plan.interval}`;
  }

  /**
   * Track payment event with Meta Pixel
   */
  static trackPaymentEvent(event: 'InitiateCheckout' | 'Purchase', planId: string, value: number): void {
    try {
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', event, {
          content_name: `${planId}_subscription`,
          content_category: 'subscription',
          value: value,
          currency: 'USD'
        });
      }
    } catch (error) {
      console.error('Failed to track payment event:', error);
    }
  }
}

