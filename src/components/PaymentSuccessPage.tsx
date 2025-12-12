import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Loader, Home } from 'lucide-react';
import { PaymentService } from '../services/paymentService';
import { AuthService } from '../services/authService';

interface PaymentSuccessPageProps {
  onGoToDashboard: () => void;
  onGoHome: () => void;
  userId: string;
}

const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({
  onGoToDashboard,
  onGoHome,
  userId
}) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'pending'>('pending');
  const [tier, setTier] = useState<'standard' | 'pro'>('standard');

  useEffect(() => {
    const verifyPaymentAndUpdateTier = async () => {
      try {
        // Get session ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (!sessionId) {
          console.error('No session ID found');
          setVerificationStatus('error');
          setIsVerifying(false);
          return;
        }

        // Verify payment with DoDo Payments
        const result = await PaymentService.verifyPayment(sessionId);

        if (result.success && result.tier) {
          setTier(result.tier);
          
          // Update user tier in Supabase
          await AuthService.updateSubscriptionTier(userId, result.tier);

          // Track purchase with Meta Pixel
          const plan = PaymentService.plans[result.tier];
          PaymentService.trackPaymentEvent('Purchase', result.tier, plan.price);

          setVerificationStatus('success');
        } else {
          setVerificationStatus('error');
        }

      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationStatus('error');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPaymentAndUpdateTier();
  }, [userId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying your payment...
          </h2>
          <p className="text-gray-600">
            Please wait while we confirm your subscription
          </p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Verification Failed
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't verify your payment. Please contact support if you were charged.
          </p>
          <button
            onClick={onGoHome}
            className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Go to Home</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to {tier === 'pro' ? 'Pro' : 'Standard'} tier! 🎉
          </p>
        </div>

        {/* What's Next */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            What's next?
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>Your account has been upgraded to {tier === 'pro' ? 'Pro' : 'Standard'}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📧</span>
              <span>A confirmation email has been sent to your inbox</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🚀</span>
              <span>You now have access to all {tier === 'pro' ? 'Pro' : 'Standard'} features</span>
            </li>
            {tier === 'standard' && (
              <li className="flex items-start">
                <span className="mr-2">🎁</span>
                <span>Enjoy your 7-day free trial!</span>
              </li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onGoToDashboard}
            className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <span>Start Researching</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onGoHome}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Go to Home</span>
          </button>
        </div>

        {/* Support */}
        <p className="text-xs text-center text-gray-500 mt-6">
          Need help? Contact us at support@insightsnap.com
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

