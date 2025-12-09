import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Crown, Star, Zap } from 'lucide-react';
import { AuthService } from '../services/authService';

interface AdminPanelProps {
  user: {
    id: string;
    name: string;
    email: string;
    subscription_tier: 'free' | 'standard' | 'pro';
    search_count: number;
  } | null;
  onClose: () => void;
  onTierUpdated: (tier: 'free' | 'standard' | 'pro') => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onClose, onTierUpdated }) => {
  const [currentTier, setCurrentTier] = useState<'free' | 'standard' | 'pro'>(user?.subscription_tier || 'free');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setCurrentTier(user.subscription_tier);
    }
  }, [user]);

  const handleUpdateTier = async (newTier: 'free' | 'standard' | 'pro') => {
    if (!user) return;

    setIsUpdating(true);
    setMessage(null);

    try {
      const result = await AuthService.updateSubscriptionTier(user.id, newTier);
      
      if (result.success) {
        setCurrentTier(newTier);
        setMessage({ type: 'success', text: `Successfully upgraded to ${newTier.toUpperCase()} tier!` });
        
        // Notify parent component
        onTierUpdated(newTier);

        // Reload page after 1.5 seconds to refresh all data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: 'Failed to update subscription tier. Please try again.' });
      }
    } catch (error) {
      console.error('Error updating tier:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  const tiers = [
    {
      id: 'free' as const,
      name: 'Free',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-gray-500',
      borderColor: 'border-gray-500',
      hoverColor: 'hover:bg-gray-600',
      features: ['5 searches per day', 'Basic insights', 'Reddit & X data'],
      limit: '5 searches/day'
    },
    {
      id: 'standard' as const,
      name: 'Standard',
      icon: <Star className="w-6 h-6" />,
      color: 'bg-blue-500',
      borderColor: 'border-blue-500',
      hoverColor: 'hover:bg-blue-600',
      features: ['50 searches per day', 'Advanced filtering', 'Export to CSV/PDF', '7-day free trial'],
      limit: '50 searches/day',
      price: '$6.99/month'
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      icon: <Crown className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      borderColor: 'border-purple-500',
      hoverColor: 'hover:from-purple-600 hover:to-pink-600',
      features: ['Unlimited searches', 'Priority support', 'Auto-translation', 'Trend alerts'],
      limit: 'Unlimited',
      price: '$14.99/month'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
              <p className="text-sm text-gray-600">Manage your subscription tier</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium px-2 py-1 bg-white rounded-full border border-gray-300">
                  Current: {currentTier.toUpperCase()}
                </span>
                <span className="text-xs text-gray-600">
                  {user.search_count} searches today
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mx-6 mt-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Tier Selection */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Subscription Tier</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative border-2 rounded-xl p-6 transition-all ${
                  currentTier === tier.id
                    ? `${tier.borderColor} bg-gradient-to-br from-white to-gray-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Current Badge */}
                {currentTier === tier.id && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Current
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`${tier.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4`}>
                  {tier.icon}
                </div>

                {/* Name & Price */}
                <h4 className="text-xl font-bold text-gray-900 mb-1">{tier.name}</h4>
                {tier.price && (
                  <p className="text-sm text-gray-600 mb-3">{tier.price}</p>
                )}

                {/* Limit */}
                <div className="mb-4">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
                    <Zap className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">{tier.limit}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                {currentTier !== tier.id && (
                  <button
                    onClick={() => handleUpdateTier(tier.id)}
                    disabled={isUpdating}
                    className={`w-full ${tier.color} ${tier.hoverColor} text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isUpdating ? 'Updating...' : `Switch to ${tier.name}`}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="p-6 bg-blue-50 border-t border-blue-100">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 rounded-full p-1 mt-0.5">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Admin Access</h4>
              <p className="text-sm text-gray-600">
                As the owner, you can switch between any tier instantly. Changes will take effect immediately after page reload. 
                Search limits and features will be updated according to your selected tier.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

