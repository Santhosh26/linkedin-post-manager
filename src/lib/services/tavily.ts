// src/lib/services/tavily.ts
import axios from 'axios';

// Get the API key from environment variables
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const BASE_URL = 'https://api.tavily.com';

interface TavilySearchParams {
  query: string;
  search_depth?: 'basic' | 'advanced';
  include_domains?: string[];
  exclude_domains?: string[];
  max_results?: number;
  topic?: 'general' | 'news';
  include_answer?: boolean | 'basic' | 'advanced';
  include_raw_content?: boolean;
  include_images?: boolean;
  time_range?: 'day' | 'week' | 'month' | 'year' | 'd' | 'w' | 'm' | 'y';
  days?: number;
}

interface TavilySearchResult {
  url: string;
  title: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  query: string;
  results: TavilySearchResult[];
  answer?: string;
  images?: Array<{url: string, description?: string}>;
  response_time?: number;
}

/**
 * Search for content using the Tavily API
 * 
 * Documentation: https://docs.tavily.com/docs/tavily-api/search-api
 */
export async function searchContent(params: TavilySearchParams): Promise<TavilyResponse> {
  try {
    // Check if API key is available
    if (!TAVILY_API_KEY) {
      console.error('TAVILY_API_KEY is not set in environment variables');
      throw new Error('Tavily API key is missing');
    }

    console.log('Searching Tavily with params:', JSON.stringify({
      ...params,
      // Don't log sensitive data
      api_key: '[REDACTED]'
    }));

    // Perform the API request with the new Authorization header
    const response = await axios.post(`${BASE_URL}/search`, params, {
      headers: {
        'Authorization': `Bearer ${TAVILY_API_KEY}`, 
        'Content-Type': 'application/json'
      }
    });

    // Return the API response data
    return response.data;
  } catch (error) {
    console.error('Error searching with Tavily:', error);
    
    // Provide more detailed error information
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid Tavily API key or authentication issue');
      }
      if (error.response?.status === 403) {
        throw new Error('Forbidden: Your Tavily API key may not have permission for this endpoint');
      }
      if (error.response?.status === 429) {
        throw new Error('Too many requests: You have exceeded your Tavily API rate limit');
      }
      if (error.response?.status === 404) {
        throw new Error('Tavily API endpoint not found. Check documentation for changes.');
      }
      if (error.response?.data) {
        throw new Error(`Tavily API error: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    throw new Error('Failed to search content with Tavily');
  }
}