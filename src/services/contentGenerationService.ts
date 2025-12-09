import { API_CONFIG, SocialPost } from './apiConfig';

export interface ScriptRequest {
  category: 'painPoints' | 'trendingIdeas' | 'contentIdeas';
  posts: SocialPost[];
  platform: 'all' | 'reddit' | 'x' | 'youtube' | 'linkedin' | 'threads';
  contentType: 'video' | 'blog' | 'social' | 'email';
  tone: 'professional' | 'casual' | 'educational' | 'entertaining';
  length: 'short' | 'medium' | 'long';
}

export interface GeneratedScript {
  title: string;
  content: string;
  keyPoints: string[];
  callToAction: string;
  hashtags?: string[];
  estimatedDuration?: string;
}

export class ContentGenerationService {
  private static readonly API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://backend-production-ca5d2.up.railway.app/api';

  // Script generation is handled by the backend API using TinyLlama
  private static async callBackendAPI(request: ScriptRequest): Promise<GeneratedScript> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/script-generation/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: request.category,
          posts: request.posts,
          platform: request.platform,
          contentType: request.contentType,
          tone: request.tone,
          length: request.length
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Backend API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      if (!data.success || !data.data) {
        throw new Error('Invalid response from backend');
      }

      return data.data;
    } catch (error) {
      console.error('Backend script generation API error:', error);
      throw error;
    }
  }

  static async generateScript(request: ScriptRequest): Promise<GeneratedScript> {
    try {
      // Prepare posts data for the prompt - show full content for single posts, truncated for multiple
      const postsContext = request.posts.length === 1 
        ? `Post from ${request.posts[0].platform.toUpperCase()} (${request.posts[0].source} - ${request.posts[0].engagement} engagement):\n"${request.posts[0].content}"`
        : request.posts.slice(0, 5).map((post, index) => 
            `${index + 1}. [${post.platform.toUpperCase()}] ${post.source} (${post.engagement} engagement): "${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}"`
          ).join('\n');

      // Create content type specific prompts
      const contentSpecs = this.getContentSpecifications(request.contentType, request.length);

      // Determine the content focus based on category with SPECIFIC requirements
      const contentFocus = request.category === 'painPoints' 
        ? `PAIN POINT SOLUTION - CREATE SPECIFIC, ACTIONABLE CONTENT:
- Identify the EXACT problem from the posts (e.g., "spending out of control when scaling from 3 to 12 employees")
- Provide 3-5 CONCRETE solutions with specific steps (e.g., "Implement weekly budget reviews every Monday at 9am")
- Give real examples, tools, or frameworks (e.g., "Use Profit First method: allocate 5% to profit account first")
- Include immediate actions they can take TODAY
- DO NOT write generic advice like "manage better" - write specific advice like "Cut contractor costs 30% by hiring 1 full-time dev instead of 3 freelancers"`
        : request.category === 'trendingIdeas'
        ? `TRENDING TOPIC ANALYSIS - CREATE MOMENTUM-DRIVEN CONTENT:
- State the SPECIFIC trend from the posts (e.g., "AI agents replacing customer service teams")
- Provide a UNIQUE angle or insight (e.g., "The real opportunity is in AI agent templates, not building agents")
- Include recent stats or numbers (e.g., "3 companies saved $50K in 2 months")
- Give 3-5 ways to capitalize on this trend NOW
- DO NOT write generic trend commentary - write specific insights with data`
        : `EDUCATIONAL CONTENT - CREATE TEACHING-FOCUSED CONTENT:
- Answer the SPECIFIC question or knowledge gap from the posts
- Break down concepts with simple examples
- Provide step-by-step process or framework
- Include real-world examples or case studies
- DO NOT write vague explanations - write clear teaching with concrete examples`;

      const prompt = `
You are a professional content creator. Your task is to write a COMPLETE, WORD-FOR-WORD ${request.contentType} script that is SPECIFIC and ACTIONABLE.

SOCIAL MEDIA POST THAT INSPIRED THIS:
${postsContext}

YOUR TASK:
${contentFocus}

CRITICAL INSTRUCTIONS:
1. Write ACTUAL CONTENT with SPECIFIC insights, solutions, and advice - NOT generic instructions like "identify the challenge" or "take action"
2. Extract and address the EXACT problems, trends, or questions from the social media posts above
3. Provide CONCRETE, ACTIONABLE steps with real examples (e.g., "Use Finmark for weekly budget tracking" not "track your budget better")
4. DO NOT use vague phrases like "let me break this down", "start by identifying", "take action", "many people struggle"
5. Include specific numbers, strategies, tools, or frameworks when relevant
6. Write as if you're an expert giving a masterclass, not a teacher explaining how to teach
7. Focus on the SPECIFIC topic/issue mentioned in the post - DO NOT mention the category "${request.category}"
8. Make it sound natural and ${request.tone}

${contentSpecs.structure}

CONTENT SPECIFICATIONS:
- Type: ${request.contentType}
- Length: ${request.length} (${contentSpecs.duration})
- Tone: ${request.tone}
- Format: Complete, ready-to-use script

EXAMPLE OF BAD vs GOOD CONTENT:
❌ BAD: "Today we'll explore the topic. First, understand the challenge. Then identify your problems. Finally, take action. Many people struggle with this."
✅ GOOD: "Your agency grew from 3 to 12 employees and spending spiraled. Here's the fix: 1) Implement the 'Rule of 40' - keep employee costs under 40% of revenue (you're at 65%). 2) Switch to weekly budget reviews every Monday at 9am using Finmark. 3) Cut contractor costs 30% - hire 1 full-time dev at $8K instead of 3 freelancers at $15K. Saves $7K/month = $84K/year. Action for TODAY: Calculate your Rule of 40 number right now."

RESPOND ONLY WITH VALID JSON:
{
  "title": "Engaging title about the specific post topic",
  "content": "COMPLETE WORD-FOR-WORD SCRIPT - Write the full script with all sentences, paragraphs, transitions. Include opening hook, main content, and closing. Make it conversational and ready to perform. This should be 200-800 words depending on length.",
  "keyPoints": ["Actual specific point from the topic", "Another concrete point", "Third actionable point"],
  "callToAction": "Natural call to action related to the topic",
  "hashtags": ["#topicHashtag", "#relevantTag", "#nicheTopic"],
  "estimatedDuration": "${contentSpecs.duration}"
}

ABSOLUTE REQUIREMENTS:
- The "content" field MUST be a complete, word-for-word script
- Write EXACTLY what the creator should say/write
- Focus entirely on the topic mentioned in the social media post
- ${request.tone === 'professional' ? 'Use professional, authoritative language' : request.tone === 'casual' ? 'Use friendly, conversational language like talking to a friend' : request.tone === 'educational' ? 'Explain concepts clearly like a teacher' : 'Make it entertaining and fun'}
- Include specific insights from the post
- Make it immediately usable without any editing needed`;

      // Use backend API instead of Perplexity
      const generatedScript = await this.callBackendAPI(request);
      
      try {
        // Validate the response from backend
        console.log('🔍 Script received from backend:', generatedScript.title);
        
        // Script is already parsed from backend
        
        // Validate required fields
        if (!generatedScript.title || !generatedScript.content || !generatedScript.keyPoints || !generatedScript.callToAction) {
          console.error('❌ Invalid script structure:', generatedScript);
          throw new Error('Invalid script structure received');
        }

        // Check if content is actually a script (not guidelines) - more strict checks
        const genericPhrases = [
          'Understanding the core issue',
          'Practical solutions and actionable advice',
          'Let me break down',
          'Start by identifying',
          'Take action',
          'Many people struggle with this',
          'First, it\'s important to understand',
          'Knowledge without action doesn\'t create change'
        ];
        
        const hasGenericContent = genericPhrases.some(phrase => 
          generatedScript.content.toLowerCase().includes(phrase.toLowerCase())
        );
        
        if (generatedScript.content.length < 100 || hasGenericContent) {
          console.warn('⚠️ Generated content contains generic phrases or is too short, regenerating...');
          // Try one more time with more aggressive prompt
          throw new Error('Generic content detected, will retry');
        }

        console.log('✅ Script generated successfully with', generatedScript.content.length, 'characters');
        return generatedScript;

      } catch (parseError) {
        console.error('❌ Failed to process script generation response:', parseError);
        
        // Fallback: Create a basic script structure
        return this.createFallbackScript(request);
      }

    } catch (error) {
      console.error('❌ Error generating script:', error);
      return this.createFallbackScript(request);
    }
  }

  private static getContentSpecifications(contentType: string, length: string) {
    const specs: Record<string, Record<string, { duration: string; structure: string }>> = {
      video: {
        short: { duration: '1-3 minutes', structure: 'Create a video script with: Hook (15 seconds), Problem identification (30 seconds), Solution/Tips (90 seconds), Call to action (15 seconds)' },
        medium: { duration: '5-8 minutes', structure: 'Create a video script with: Introduction (30 seconds), Problem deep-dive (2 minutes), Multiple solutions with examples (4 minutes), Conclusion and CTA (30 seconds)' },
        long: { duration: '10-15 minutes', structure: 'Create a comprehensive video script with: Introduction (1 minute), Background context (2 minutes), Detailed analysis (6 minutes), Step-by-step solutions (5 minutes), Conclusion (1 minute)' }
      },
      blog: {
        short: { duration: '3-5 minute read', structure: 'Create a blog post with: Compelling headline, Brief introduction, 3-5 main points with examples, Conclusion with CTA' },
        medium: { duration: '7-10 minute read', structure: 'Create a detailed blog post with: Introduction, Problem statement, 5-7 main sections with subheadings, Examples and case studies, Actionable tips, Conclusion' },
        long: { duration: '15-20 minute read', structure: 'Create a comprehensive guide with: Executive summary, Detailed introduction, Multiple main sections, In-depth analysis, Case studies, Step-by-step instructions, Resources and conclusion' }
      },
      social: {
        short: { duration: 'Quick post', structure: 'Create a social media post with: Attention-grabbing hook, Key insight, Value proposition, Call to action' },
        medium: { duration: 'Thread/carousel', structure: 'Create a social media thread/carousel with: Hook post, 3-5 supporting posts with tips/insights, Engagement question, CTA post' },
        long: { duration: 'Series of posts', structure: 'Create a social media series with: Announcement post, 5-7 educational posts, Interactive elements, Community engagement prompts' }
      },
      email: {
        short: { duration: '2-3 minute read', structure: 'Create an email with: Subject line, Personal greeting, Main message with 2-3 key points, Clear CTA' },
        medium: { duration: '5-7 minute read', structure: 'Create a newsletter with: Engaging subject, Introduction, 3-4 main sections, Personal insights, Resources/links, CTA' },
        long: { duration: '10-12 minute read', structure: 'Create a comprehensive email with: Compelling subject, Personal story/intro, Detailed content sections, Examples and case studies, Multiple CTAs' }
      }
    };

    return specs[contentType]?.[length] || specs.blog.medium;
  }

  private static createFallbackScript(request: ScriptRequest): GeneratedScript {
    // If fallback is needed, show clear error message
    // This fallback should RARELY be used - it means both API calls failed
    const firstPost = request.posts[0];
    const platform = firstPost?.platform.toUpperCase() || 'SOCIAL MEDIA';
    const source = firstPost?.source || 'a community member';
    const postContent = firstPost?.content || 'Unable to load post content';
    
    // Extract actual content from the post (up to 300 chars for context)
    const contentPreview = postContent.substring(0, 300);
    
    // Try to extract key words/topics from the post
    const words = postContent.toLowerCase().split(/\s+/);
    const meaningfulWords = words.filter(w => w.length > 5);
    const possibleTopic = meaningfulWords.slice(0, 3).join(' ') || 'this topic';
    
    return {
      title: `Script Generation Unavailable - API Error`,
      content: `⚠️ We encountered an issue generating your script. This could be due to:

• API rate limits
• Network connectivity issues  
• Content moderation filters

The original post was about:
"${contentPreview}${postContent.length > 300 ? '...' : ''}"

Source: ${source} on ${platform}

Please try again in a few moments, or:
1. Refresh the page and try again
2. Try generating a script for a different post
3. Contact support if the issue persists

We apologize for the inconvenience!`,
      keyPoints: [
        'Script generation temporarily unavailable',
        'Please try again shortly',
        'Contact support if issue persists'
      ],
      callToAction: 'Try generating again or contact support',
      hashtags: ['#error', '#tryagain'],
      estimatedDuration: 'N/A'
    };
  }

  // New method using backend API with enhanced Perplexity intelligence
  static async generateScriptViaBackend(request: ScriptRequest): Promise<GeneratedScript> {
    try {
      console.log('🎬 Generating script via backend API...');
      
      const response = await fetch(`${this.API_BASE_URL}/scripts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Script generation failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Script generation failed');
      }

      console.log('✅ Script generated successfully via backend');
      return result.data;

    } catch (error) {
      console.error('❌ Backend script generation error:', error);
      throw error;
    }
  }
}
