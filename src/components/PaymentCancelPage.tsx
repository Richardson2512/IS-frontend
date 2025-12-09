import React from 'react';
import { XCircle, ArrowLeft, Home, HelpCircle } from 'lucide-react';

interface PaymentCancelPageProps {
  onGoBack: () => void;
  onGoHome: () => void;
  onContactSupport: () => void;
}

const PaymentCancelPage: React.FC<PaymentCancelPageProps> = ({
  onGoBack,
  onGoHome,
  onContactSupport
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Cancel Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <XCircle className="w-12 h-12 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-lg text-gray-600">
            Your payment was not completed
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-900">
            Don't worry, you haven't been charged. You can try again anytime or continue using the free plan.
          </p>
        </div>

        {/* Why users cancel - helpful tips */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <HelpCircle className="w-4 h-4 mr-1" />
            Need help deciding?
          </h2>
          <ul className="space-y-1 text-xs text-gray-700">
            <li>• Start with our free plan - no credit card required</li>
            <li>• Upgrade anytime when you're ready for more features</li>
            <li>• 7-day free trial available for Standard plan</li>
            <li>• Cancel anytime with no questions asked</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onGoBack}
            className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Go to Home</span>
          </button>

          <button
            onClick={onContactSupport}
            className="w-full text-indigo-600 px-6 py-2 rounded-xl font-medium hover:bg-indigo-50 transition-colors"
          >
            Contact Support
          </button>
        </div>

        {/* Support */}
        <p className="text-xs text-center text-gray-500 mt-6">
          Questions? We're here to help at support@insightsnap.com
        </p>
      </div>
    </div>
  );
};

export default PaymentCancelPage;

