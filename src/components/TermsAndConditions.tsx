import React, { useEffect } from 'react';
import { Twitter, Youtube, Instagram, Facebook, Mail } from 'lucide-react';
import { MetaPixelService } from '../services/metaPixelService';

interface User {
  id: string;
  name: string;
  email: string;
  subscription_tier: 'free' | 'standard' | 'pro';
  search_count: number;
}

interface TermsAndConditionsProps {
  onHome: () => void;
  onContact: () => void;
  onBlog: () => void;
  onPrivacyPolicy: () => void;
  onTermsAndConditions: () => void;
  user: User | null;
  onSignOut: () => void;
  onLogin: () => void;
  onSignUp: () => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onHome, onContact, onBlog, onPrivacyPolicy, onTermsAndConditions, user, onSignOut, onLogin, onSignUp }) => {
  useEffect(() => {
    MetaPixelService.trackPageView('terms-and-conditions');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-0">
              <button 
                onClick={onHome}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/logo.png" 
                  alt="InsightSnap Logo" 
                  className="w-16 h-16"
                />
              </button>
              <button 
                onClick={onHome}
                className="text-xl font-bold hover:text-indigo-600 transition-colors"
              >
                InsightSnap
              </button>
            </div>
            
            {/* Center Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={onHome}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2"
              >
                Home
              </button>
              <button 
                onClick={onBlog}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2"
              >
                Blog
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">
                      {user.name}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        user.subscription_tier === 'pro' ? 'bg-purple-100 text-purple-800' :
                        user.subscription_tier === 'standard' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {onSignOut && (
                      <button
                        onClick={onSignOut}
                        className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onLogin}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={onSignUp}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using InsightSnap ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                InsightSnap is an AI-powered social media research platform that analyzes content from Reddit, X (Twitter), and other social media platforms to provide insights, trending topics, and content ideas. Our service includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Social media content analysis and insights</li>
                <li>Trending topic identification</li>
                <li>Content idea generation</li>
                <li>Export functionality for research data</li>
                <li>Multiple subscription tiers with varying features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription Plans and Billing</h2>
              <div className="mb-4">
                <h3 className="text-xl font-medium text-gray-900 mb-3">4.1 Subscription Tiers</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li><strong>Free Plan:</strong> 5 searches per day, basic features</li>
                  <li><strong>Standard Plan ($6.99/month):</strong> 50 searches per day, time period filtering, 30 exports per month</li>
                  <li><strong>Pro Plan ($14.99/month):</strong> Unlimited searches, advanced features, priority support</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-medium text-gray-900 mb-3">4.2 Trial Periods</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Standard and Pro plans include 7-day free trial periods. You may cancel your subscription at any time during the trial period without being charged.
                </p>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-medium text-gray-900 mb-3">4.3 Billing and Payments</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Subscriptions are billed monthly in advance</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>You authorize us to charge your payment method for recurring charges</li>
                  <li>Price changes will be communicated 30 days in advance</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to use the Service for any unlawful purpose or any purpose prohibited under this clause. You may not use the Service in any manner that could damage, disable, overburden, or impair any server, or the network(s) connected to any server.
              </p>
              <div className="mb-4">
                <h3 className="text-xl font-medium text-gray-900 mb-3">Prohibited Activities:</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Attempting to gain unauthorized access to any part of the Service</li>
                  <li>Using the Service to violate any applicable laws or regulations</li>
                  <li>Transmitting or uploading malicious code or harmful content</li>
                  <li>Reselling or redistributing the Service without authorization</li>
                  <li>Scraping or automated data collection beyond permitted limits</li>
                  <li>Creating multiple accounts to circumvent usage limits</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Service and its original content, features, and functionality are and will remain the exclusive property of InsightSnap and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You retain ownership of any content you create using our Service. By using our Service, you grant us a limited license to process and analyze publicly available social media content for the purpose of providing our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data and Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Service. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                We analyze publicly available social media content to provide our services. We do not access private or restricted content without proper authorization.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We strive to maintain high service availability but cannot guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or technical issues. We reserve the right to modify or discontinue the Service with reasonable notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To the maximum extent permitted by law, InsightSnap shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may terminate your account at any time by contacting our support team or using the account settings in the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms and Conditions, please contact us through our Contact page or at the following:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> support@insightsnap.co<br/>
                  <strong>Website:</strong> https://insightsnap.co/contact
                </p>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-500">
                By using InsightSnap, you acknowledge that you have read and understood these Terms and Conditions and agree to be bound by them.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-0 mb-4">
                <button 
                  onClick={onHome}
                  className="flex items-center hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/logo.png" 
                    alt="InsightSnap Logo" 
                    className="w-16 h-16"
                  />
                </button>
                <button 
                  onClick={onHome}
                  className="text-xl font-bold hover:text-indigo-400 transition-colors"
                >
                  InsightSnap
                </button>
              </div>
              <p className="text-gray-400">
                Discover what your audience really wants with AI-powered social media insights.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:contact@insightsnap.co" className="hover:text-white transition-colors">
                    contact@insightsnap.co
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={onBlog}
                    className="hover:text-white transition-colors text-left w-full"
                  >
                    Blog
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onContact}
                    className="hover:text-white transition-colors text-left w-full"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onPrivacyPolicy}
                    className="hover:text-white transition-colors text-left w-full"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={onTermsAndConditions}
                    className="hover:text-white transition-colors text-left w-full"
                  >
                    Terms & Conditions
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://x.com/InsightSnapAI" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="X (Twitter)">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://www.facebook.com/InsightsnapAI/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/insightsnap.ai/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.youtube.com/@InsightSnap_AI" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="YouTube">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="https://www.reddit.com/user/InsightSnap/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Reddit">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 InsightSnap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndConditions;
