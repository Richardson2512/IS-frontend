import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface UpgradePromptProps {
  userTier: 'free' | 'standard' | 'pro';
  onPricing: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ userTier, onPricing }) => {
  // Only show for free and standard users
  if (userTier === 'pro') {
    return null;
  }

  const isFree = userTier === 'free';
  const benefits = isFree
    ? [
        'Unlimited searches per day',
        '15 results per category (5 per platform)',
        'Unlimited AI script generations',
        'Auto-translation support',
        'Priority support'
      ]
    : [
        'Unlimited searches per day',
        '15 results per category (5 per platform)',
        'Unlimited AI script generations',
        'Auto-translation support',
        'Priority support',
        'Trend alerts'
      ];

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl p-6 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-900">
              {isFree ? 'Upgrade to Pro for Better Experience' : 'Upgrade to Pro for Maximum Power'}
            </h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            {isFree
              ? 'Get unlimited searches, more results, and advanced features with Pro plan.'
              : 'Unlock unlimited searches, more results per category, and premium features.'}
          </p>
          <ul className="space-y-2 mb-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={onPricing}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
          >
            <span>Upgrade to Pro</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

