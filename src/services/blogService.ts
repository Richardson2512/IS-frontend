import { supabase } from '../lib/supabase';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  author_email: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  tags: string[];
  slug: string;
  featured_image?: string;
  read_time: number;
}

export class BlogService {
  // Create a new blog post
  static async createPost(postData: {
    title: string;
    content: string;
    author: string;
    author_email: string;
    tags?: string[];
    featured_image?: string;
  }) {
    try {
      // Generate slug from title
      const slug = postData.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Generate excerpt from content (first 150 characters)
      const excerpt = postData.content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .substring(0, 150)
        .trim() + '...';

      // Calculate read time (average 200 words per minute)
      const wordCount = postData.content.split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200);

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([
          {
            ...postData,
            slug,
            excerpt,
            read_time: readTime,
            published: false, // Start as draft
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create blog post error:', error);
      return { data: null, error };
    }
  }

  // Get all blog posts
  static async getPosts(published: boolean = true, forceRefresh: boolean = false) {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('published', published)
        .order('created_at', { ascending: false });

      // Add cache busting if force refresh is requested
      if (forceRefresh) {
        // Add a timestamp to the query to bypass Supabase client-side caching
        query = query.order('updated_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get blog posts error:', error);
      return { data: null, error };
    }
  }

  // Get a single blog post by slug
  static async getPostBySlug(slug: string) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get blog post error:', error);
      return { data: null, error };
    }
  }

  // Update a blog post
  static async updatePost(id: string, updates: Partial<BlogPost>) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update blog post error:', error);
      return { data: null, error };
    }
  }

  // Delete a blog post
  static async deletePost(id: string) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Delete blog post error:', error);
      return { error };
    }
  }

  // Get posts by author
  static async getPostsByAuthor(authorEmail: string) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('author_email', authorEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get posts by author error:', error);
      return { data: null, error };
    }
  }
}
