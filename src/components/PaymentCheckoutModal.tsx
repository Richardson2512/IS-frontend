import React, { useState } from 'react';
import { X, Check, Loader, CreditCard, Shield, Lock } from 'lucide-react';
import { PaymentService } from '../services/paymentService';

interface User {
  id: string;
  email: string;
  name: string;
  subscription_tier: 'free' | 'standard' | 'pro';
}

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  selectedPlan: 'standard' | 'pro';
  onPaymentInitiated?: () => void;
}

const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  user,
  selectedPlan,
  onPaymentInitiated
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const plan = PaymentService.plans[selectedPlan];

  const handleCheckout = async () => {
    if (!user) {
      setError('Please log in to continue');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Track checkout initiation
      PaymentService.trackPaymentEvent('InitiateCheckout', selectedPlan, plan.price);

      // Create payment session
      const result = await PaymentService.createPaymentSession(
        selectedPlan,
        user.id,
        user.email,
        `${window.location.origin}/payment-success`,
        `${window.location.origin}/payment-cancel`
      );

      if (result.success && result.checkoutUrl) {
        // Call callback if provided
        if (onPaymentInitiated) {
          onPaymentInitiated();
        }

        // Redirect to checkout
        PaymentService.redirectToCheckout(result.checkoutUrl);
      } else {
        setError(result.error || 'Failed to initialize payment. Please try again.');
      }

    } catch (err) {
      console.error('Checkout error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            Upgrade to {plan.displayName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pricing */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
            <div className="flex items-baseline justify-center space-x-2">
              <span className="text-5xl font-bold text-indigo-600">
                ${plan.price.toFixed(2)}
              </span>
              <span className="text-xl text-gray-600">/{plan.interval}</span>
            </div>
            {selectedPlan === 'standard' && (
              <p className="text-center text-sm text-indigo-600 mt-2 font-medium">
                🎉 7 days free trial for first-time users
              </p>
            )}
            {selectedPlan === 'pro' && (
              <p className="text-center text-sm text-purple-600 mt-2 font-medium">
                🎉 7 days free trial for first-time Standard users
              </p>
            )}
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              What's included:
            </h3>
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Security badges */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Secure payment processing</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="w-4 h-4 text-green-600" />
              <span>SSL encrypted checkout</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CreditCard className="w-4 h-4 text-green-600" />
              <span>Cancel anytime, no questions asked</span>
            </div>
          </div>

          {/* User info */}
          {user && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Billing to:</span> {user.email}
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleCheckout}
              disabled={isProcessing || !user}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                isProcessing || !user
                  ? 'bg-gray-400 cursor-not-allowed'
                  : selectedPlan === 'pro'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Proceed to Payment</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full py-3 px-6 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-gray-500">
            By proceeding, you agree to our Terms of Service and Privacy Policy.
            Your subscription will auto-renew monthly until cancelled.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckoutModal;

