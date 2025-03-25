//src\lib\services\unsplash.ts
import axios from 'axios';

const UNSPLASH_API_URL = 'https://api.unsplash.com';
const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
}

export async function searchImages(query: string, page = 1, perPage = 20): Promise<UnsplashImage[]> {
  try {
    const response = await axios.get(`${UNSPLASH_API_URL}/search/photos`, {
      params: {
        query,
        page,
        per_page: perPage,
      },
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
    });

    return response.data.results;
  } catch (error) {
    console.error('Error searching Unsplash images:', error);
    throw new Error('Failed to search images');
  }
}

export async function getRandomImages(query: string, count = 5): Promise<UnsplashImage[]> {
  try {
    const response = await axios.get(`${UNSPLASH_API_URL}/photos/random`, {
      params: {
        query,
        count,
      },
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching random Unsplash images:', error);
    throw new Error('Failed to fetch random images');
  }
}