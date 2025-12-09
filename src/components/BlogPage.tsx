import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Tag, Twitter, Youtube, Instagram, Facebook, Mail, RefreshCw } from 'lucide-react';
import { BlogService, BlogPost } from '../services/blogService';
import { MetaPixelService } from '../services/metaPixelService';

interface BlogPageProps {
  onHome: () => void;
  onContact: () => void;
  onBlog: () => void;
  onPrivacyPolicy: () => void;
  onTermsAndConditions: () => void;
  onLogin: () => void;
  onSignUp: () => void;
  onBlogPost: (slug: string) => void;
  user: { 
    id: string;
    name: string; 
    email: string;
    subscription_tier: 'free' | 'standard' | 'pro';
    search_count: number;
  } | null;
  onSignOut: () => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onHome, onContact, onBlog, onPrivacyPolicy, onTermsAndConditions, onLogin, onSignUp, onBlogPost, user, onSignOut }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
    MetaPixelService.trackPageView('blog');
  }, []);

  const loadPosts = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      // Pass forceRefresh to BlogService to bypass caching
      const { data, error } = await BlogService.getPosts(true, forceRefresh);
      if (error) throw error;
      setPosts(data || []);
      console.log('📝 Blog posts loaded:', data?.length || 0, 'posts', forceRefresh ? '(force refresh)' : '');
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
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
              <button 
                onClick={onContact}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2"
              >
                Contact
              </button>
            </div>
            
            {/* Right side */}
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

      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold">InsightSnap Blog</h1>
            <button
              onClick={() => loadPosts(true)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Refresh blog posts"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
            Insights, tips, and strategies for understanding your audience through social media research
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Posts List */}
        <div className="max-w-4xl mx-auto space-y-8">
          {posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No blog posts yet</h3>
              <p className="text-gray-600 text-lg">Check back soon for insightful articles and updates!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Featured Image */}
                {post.featured_image && (
                  <div className="w-full h-64 overflow-hidden">
                    <img 
                      src={post.featured_image} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-8">
                  {/* Post Header */}
                  <h2 
                    className="text-3xl font-bold text-gray-900 mb-4 hover:text-indigo-600 transition-colors"
                    dangerouslySetInnerHTML={{ __html: post.title }}
                  />
                  
                  {/* Excerpt */}
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">{post.excerpt}</p>
                  
                  {/* Meta Info */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-indigo-600" />
                        <span className="font-medium text-gray-700">{post.author}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                        {formatDate(post.created_at)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                        {post.read_time} min read
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex items-center gap-2 mb-6">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Content Preview */}
                  <div 
                    className="prose prose-lg max-w-none text-gray-700 mb-6"
                    dangerouslySetInnerHTML={{ __html: post.content.substring(0, 300) + '...' }}
                  />
                  
                  {/* Read More Button */}
                  <button 
                    onClick={() => onBlogPost(post.slug)}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Read Full Article
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

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

export default BlogPage;
