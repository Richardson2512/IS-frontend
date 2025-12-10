// API Configuration - Compatible with both Vite and Create React App
const getEnvVar = (key: string): string => {
  // Try Vite first (import.meta.env)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[`VITE_${key}`] || '';
  }
  // Fallback to Create React App (process.env)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[`REACT_APP_${key}`] || '';
  }
  // Fallback to empty string
  return '';
};

// ScrapeCreators API is now used for all platforms
export const API_CONFIG = {
  scrapecreators: {
    apiKey: getEnvVar('SCRAPECREATORS_API_KEY'),
    baseUrl: 'https://api.scrapecreators.com'
  }
};

/**
 * Get normalized backend API URL
 * Ensures the URL ends with /api for consistent endpoint construction
 * @param baseUrl - The base backend URL from environment variable
 * @returns Normalized URL ending with /api
 */
export function getBackendApiUrl(baseUrl: string): string {
  if (!baseUrl) {
    throw new Error('Backend URL is required');
  }
  
  const trimmed = baseUrl.trim();
  
  // Remove trailing slash
  const withoutTrailingSlash = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  
  // Ensure it ends with /api
  if (withoutTrailingSlash.endsWith('/api')) {
    return withoutTrailingSlash;
  }
  
  return `${withoutTrailingSlash}/api`;
}



export interface SearchParams {
  query: string;
  language: string;
  timeFilter: string;
  platforms: string[];
}

export interface SocialPost {
  id: string;
  content: string;
  platform: 'reddit' | 'x' | 'youtube' | 'linkedin' | 'threads';
  source: string;
  engagement: number;
  timestamp: string;
  url?: string;
  author?: string;
}

export interface AnalyzedResults {
  painPoints: SocialPost[];
  trendingIdeas: SocialPost[];
  contentIdeas: SocialPost[];
}

export interface NoResultsMessage {
  title: string;
  message: string;
  reasons: string[];
  suggestions: string[];
  tip: string;
}