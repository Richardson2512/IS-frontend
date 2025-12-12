/**
 * Utility to publish the blog post to Supabase
 * 
 * This can be called from the browser console or added as a button in the admin panel
 */

import { BlogService } from '../services/blogService';

// Helper function to add hyperlinks to all instances of "InsightSnap"
function addInsightSnapLinks(text: string): string {
  return text.replace(/InsightSnap/g, '<a href="https://insightsnap.co" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-800 font-semibold">InsightSnap</a>');
}

export async function publishContentCreatorsBlogPost() {
  try {
    console.log('📝 Publishing blog post...');

    const title = 'How InsightSnap Empowers Content Creators with Multi-Platform Content Research';
    
    const rawContent = `<div class="prose prose-lg max-w-none">
<h2>The Challenge: Modern Content Research</h2>

<p>For today's creators, finding fresh, authentic, and trending content ideas is more difficult than ever. With audiences scattered across social platforms like Reddit, X (formerly Twitter), and YouTube, researching what truly resonates can feel overwhelming. Traditional tools often require manual monitoring, platform-specific logins, and endless scrolling, leaving creators exhausted and inspiration-limited.</p>

<h2>The Solution: InsightSnap's Unified Intelligence</h2>

<p>InsightSnap was built specifically for the modern creator who wants actionable insights without the hassle. By integrating real-time data from Reddit subreddits, X posts, and YouTube comments, InsightSnap brings together a treasure trove of audience opinions, pain points, and trends in a single, dynamic dashboard.</p>

<h2>Features That Power Content Decisions</h2>

<h3>Multi-Platform Analysis</h3>

<p>Instead of searching topics individually across platforms, InsightSnap lets users search any keyword or topic and instantly returns in-depth, AI-powered insights gathered from multiple communities. Creators see how discussions evolve on Reddit, what's trending on X, and how audiences react in YouTube comments—all at a glance.</p>

<h3>AI-Powered Topic Discovery</h3>

<p>The platform's algorithms analyze vast streams of natural conversations, surfacing not just trending ideas but also the underlying questions and pain points driving audience engagement.</p>

<h3>Audience Sentiment and Demand</h3>

<p>InsightSnap reviews comments, posts, and threads to highlight not just volumes but sentiment—making it easy for creators to spot what excites, frustrates, or inspires their audiences.</p>

<h3>Competitive Inspiration</h3>

<p>Creators can monitor how competitors approach a topic and discover gaps or opportunities by comparing content engagement across platforms.</p>

<h2>Real-World Impact</h2>

<p>Imagine a creator planning a video series about technology trends. With InsightSnap, they start by searching "AI tools" and quickly see what Redditors are debating, which tweets are going viral, and what questions are being asked in YouTube comments. The platform not only shows popular topics but also offers a breakdown of audience tone and recurring questions, letting creators build content with confidence and relevance.</p>

<h2>Why InsightSnap Stands Out</h2>

<h3>Time-Saving</h3>

<p>Say goodbye to juggling browser tabs and manual research. InsightSnap automates the process, delivers instant results, and ensures nothing important is missed.</p>

<h3>Holistic View</h3>

<p>By combining insights from three major platforms, creators get a full spectrum view of audience interests, maximizing originality and reach.</p>

<h3>Data-Driven</h3>

<p>The platform turns unstructured conversation data into structured analytics, supporting better editorial decisions and content strategies.</p>

<h2>Conclusion</h2>

<p>InsightSnap revolutionizes how creators research by breaking platform silos and amplifying creative intelligence. It lets creators focus on making inspiring content—not chasing trends one platform at a time.</p>
</div>`;

    // Add hyperlinks to all "InsightSnap" mentions
    const content = addInsightSnapLinks(rawContent);

    const postData = {
      title,
      content,
      author: 'InsightSnap Team',
      author_email: 'contact@insightsnap.co',
      tags: ['content creation', 'social media research', 'AI tools', 'content strategy', 'multi-platform'],
      featured_image: undefined // You can add a featured image URL here if you have one
    };

    console.log('📊 Creating blog post...');

    // Create the post (initially as draft)
    const { data: createdPost, error: createError } = await BlogService.createPost(postData);

    if (createError || !createdPost) {
      console.error('❌ Error creating blog post:', createError);
      return { success: false, error: createError };
    }

    console.log('✅ Blog post created:', createdPost.id);
    console.log('📍 Publishing blog post...');

    // Publish the post
    const { data: publishedPost, error: publishError } = await BlogService.updatePost(createdPost.id, {
      published: true
    });

    if (publishError) {
      console.error('❌ Error publishing blog post:', publishError);
      return { success: false, error: publishError };
    }

    console.log('✅ Blog post published successfully!');
    console.log('📍 Post ID:', publishedPost?.id);
    console.log('🔗 Slug:', publishedPost?.slug);
    console.log('📖 Read time:', publishedPost?.read_time, 'minutes');
    console.log('🏷️ Tags:', publishedPost?.tags?.join(', '));
    console.log('\n🌐 The blog post is now live and accessible to the public at /blog');

    return { 
      success: true, 
      post: publishedPost 
    };

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { 
      success: false, 
      error 
    };
  }
}

// To use this from the browser console:
// 1. Open your app in the browser
// 2. Open the browser console (F12)
// 3. Run: await publishContentCreatorsBlogPost()

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).publishContentCreatorsBlogPost = publishContentCreatorsBlogPost;
}

