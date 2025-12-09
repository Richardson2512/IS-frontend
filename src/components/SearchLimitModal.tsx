import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface SearchLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
  searchCount: number;
  userTier?: 'free' | 'standard' | 'pro';
  isLoggedIn?: boolean;
}

const SearchLimitModal: React.FC<SearchLimitModalProps> = ({
  isOpen,
  onClose,
  onSignUp,
  searchCount,
  userTier = 'free',
  isLoggedIn = false
}) => {
  if (!isOpen) return null;

  const limits = {
    free: 5,
    standard: 50,
    pro: 999999
  };

  const currentLimit = limits[userTier];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Search Limit Reached</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isLoggedIn ? (
            <>
              <p className="text-gray-600 mb-4">
                You've reached your limit of 5 searches. Sign up to get 5 searches per day for free!
              </p>
              <p className="text-gray-900 font-medium mb-4">
                Create a free account to continue searching
              </p>
            </>
          ) : (
            <p className="text-gray-600 mb-4">
              You've reached your daily limit of {currentLimit} searches.
            </p>
          )}
          
          {!isLoggedIn ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Free Account Benefits</h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                  <li>5 searches per day (resets every 24 hours)</li>
                  <li>3 AI script generations (lifetime)</li>
                  <li>AI-powered insights from Reddit & X</li>
                  <li>No credit card required</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onSignUp();
                    onClose();
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                >
                  Sign Up for Free
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Maybe Later
                </button>
              </div>
            </>
          ) : userTier === 'free' && isLoggedIn ? (
            <>
              <p className="text-gray-900 font-medium mb-4">
                Upgrade to get more searches and unlock premium features!
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Standard Plan - $6.99/month</h3>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                      <li>50 searches per day</li>
                      <li>Time period filtering</li>
                      <li>30 exports to CSV/PDF per month</li>
                      <li><span className="text-blue-600 font-medium">🎁 7-day FREE trial</span></li>
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Pro Plan - $14.99/month</h3>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                      <li>Unlimited searches</li>
                      <li>Advanced time filtering</li>
                      <li>Auto-translation & Priority support</li>
                      <li><span className="text-blue-600 font-medium">🎁 7-day FREE trial (for Standard users)</span></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onSignUp();
                    onClose();
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                >
                  Start Free Trial - Upgrade Now
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Maybe Later
                </button>
              </div>
            </>
          ) : null}
          
          {userTier === 'standard' && (
            <>
              <p className="text-gray-900 font-medium mb-4">
                Upgrade to Pro for unlimited searches!
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Pro Plan - $14.99/month</h3>
                <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                  <li>Unlimited searches</li>
                  <li>Advanced time filtering</li>
                  <li>Auto-translation</li>
                  <li>Priority support & Trend alerts</li>
                  <li><span className="text-blue-600 font-medium">🎁 7-day FREE trial</span></li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onSignUp();
                    onClose();
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                >
                  Start Free Trial - Upgrade to Pro
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Maybe Later
                </button>
              </div>
            </>
          )}
          
          {userTier === 'pro' && (
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchLimitModal;
