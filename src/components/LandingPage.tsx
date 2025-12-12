import React, { useEffect, useState } from 'react';
import { Search, TrendingUp, MessageSquare, Lightbulb, Check, Star, ArrowRight, Twitter, Youtube, Instagram, Facebook, Mail, Sparkles } from 'lucide-react';
import { MetaPixelService } from '../services/metaPixelService';
import PaymentCheckoutModal from './PaymentCheckoutModal';

interface User {
  id: string;
  name: string;
  email: string;
  subscription_tier: 'free' | 'standard' | 'pro';
  search_count: number;
}

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onSignUp: () => void;
  onContact: () => void; 
  onPrivacyPolicy: () => void;
  onTermsAndConditions: () => void;
  onBlog: () => void;
  onPricing: () => void;
  user: User | null;
  onSignOut: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, onSignUp, onContact, onPrivacyPolicy, onTermsAndConditions, onBlog, onPricing, user, onSignOut }) => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'pro'>('standard');

  useEffect(() => {
    MetaPixelService.trackPageView('home');
  }, []);

  const handleLogoClick = () => {
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Pain Point Discovery",
      description: "Uncover real struggles and challenges your audience faces in real-time across Reddit, X, and YouTube discussions."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Trending Ideas",
      description: "Stay ahead of the curve with emerging trends and topics gaining momentum in your niche."
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Content Inspiration",
      description: "Get ready-to-create content ideas based on what your audience is actively requesting."
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Multi-Platform Analysis",
      description: "Comprehensive real-time insights from Reddit subreddits, X posts, and YouTube comments in one place."
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Content Research only",
        "25 searches per month",
        "3 AI script generations (lifetime)",
        "Real-time insights",
        "3 exports to CSV/PDF per month",
        "3 results per category (combined)",
        "Community support"
      ],
      buttonText: "Get Started",
      popular: false,
      trialText: null
    },
    {
      name: "Standard",
      price: "$6.99",
      period: "month",
      description: "For growing creators",
      features: [
        "Content Research + Ad Intelligence",
        "25 searches per day (Content Research)",
        "25 searches per day (Ad Intelligence)",
        "25 AI script generations per day",
        "Time period filtering",
        "9 results per category (3 per platform)",
        "30 exports to CSV/PDF per month",
        "Email support"
      ],
      buttonText: "Get Started",
      popular: false,
      trialText: "7 days free trial for first-time users"
    },
    {
      name: "Pro",
      price: "$14.99",
      period: "month",
      description: "For serious content creators",
      features: [
        "Content Research + Ad Intelligence + Enhanced AI Search",
        "Unlimited searches (all features)",
        "Unlimited AI script generations",
        "Advanced time filtering",
        "15 results per category (5 per platform)",
        "Auto-translation",
        "Priority support",
        "Trend alerts"
      ],
      buttonText: "Get Started",
      popular: true,
      trialText: "7 days free trial for first-time Standard users"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "YouTube Creator",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      content: "ContentInsight helped me discover pain points I never knew existed in my niche. My engagement increased 300% in just 2 months!"
    },
    {
      name: "Marcus Rodriguez",
      role: "Content Strategist",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      content: "The trending ideas feature is a game-changer. I'm always ahead of the curve now, creating content before topics explode."
    },
    {
      name: "Emily Johnson",
      role: "Social Media Manager",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      content: "Managing content for 5 brands became so much easier. The insights are incredibly accurate and actionable."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-0">
              <button 
                onClick={handleLogoClick}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/logo.png" 
                  alt="InsightSnap Logo" 
                  className="w-16 h-16"
                />
              </button>
              <button 
                onClick={handleLogoClick}
                className="text-xl font-bold hover:text-indigo-600 transition-colors"
              >
                InsightSnap
              </button>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={onPricing}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={onBlog}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Blog
              </button>
              <button 
                onClick={onContact}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Contact
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    Welcome, <span className="font-medium text-gray-900">{user.name}</span>
                  </div>
                  <button
                    onClick={onSignOut}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Discover What Your
              <span className="text-indigo-600 block">Audience Really Wants</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Uncover pain points, trending ideas, and content opportunities from millions of 
              conversations across Reddit, X, and YouTube in real-time. Create content that truly resonates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={onGetStarted}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Get Insights</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">1M+</div>
                <div className="text-gray-600">Discussions Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">50K+</div>
                <div className="text-gray-600">Content Creators</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">300%</div>
                <div className="text-gray-600">Avg. Engagement Boost</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Create Winning Content
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform analyzes millions of conversations to give you actionable insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors">
                  <div className="text-indigo-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get insights in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Search Your Topic</h3>
              <p className="text-gray-600">Enter any topic, niche, or keyword you want to explore</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Analysis</h3>
              <p className="text-gray-600">Our AI analyzes millions of conversations across platforms</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Insights</h3>
              <p className="text-gray-600">Receive organized insights: pain points, trends, and content ideas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Content Creators Worldwide
            </h2>
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-gray-600">4.9/5 from 2,000+ reviews</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl">
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your content creation needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all duration-200 hover:shadow-lg flex flex-col h-full ${
                  plan.popular 
                    ? 'border-indigo-500 relative' 
                    : 'border-gray-200 hover:border-indigo-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-3 text-sm">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1 text-sm">/{plan.period}</span>
                  </div>
                  
                  {/* Free Trial Badge - Fixed height container */}
                  <div className="mt-3 h-8 flex items-center justify-center">
                    {plan.trialText && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {plan.trialText}
                      </span>
                    )}
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className={`text-sm ${
                        feature.includes('Coming Soon') 
                          ? 'text-gray-500 italic' 
                          : 'text-gray-700'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                {/* Button container at bottom */}
                <div className="mt-auto">
                  <button
                    onClick={() => {
                      if (plan.name === 'Free') {
                        onGetStarted();
                      } else if (user) {
                        // User is logged in, open payment modal
                        setSelectedPlan(plan.name.toLowerCase() as 'standard' | 'pro');
                        setPaymentModalOpen(true);
                      } else {
                        // User is not logged in, show sign up modal
                        onSignUp();
                      }
                    }}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors text-sm ${
                      plan.popular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {user && plan.name !== 'Free' ? 'Upgrade Now' : plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Create Content That Converts?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of creators who are already using ContentInsight to grow their audience
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-0 mb-4">
                <button 
                  onClick={handleLogoClick}
                  className="flex items-center hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/logo.png" 
                    alt="InsightSnap Logo" 
                    className="w-16 h-16"
                  />
                </button>
                <button 
                  onClick={handleLogoClick}
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

      {/* Payment Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        user={user}
        selectedPlan={selectedPlan}
        onPaymentInitiated={() => {
          console.log('Payment initiated for', selectedPlan);
        }}
      />
    </div>
  );
};

export default LandingPage;
