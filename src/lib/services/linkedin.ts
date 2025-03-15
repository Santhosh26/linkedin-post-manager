// src/lib/services/linkedin.ts
import axios from 'axios';

// Types for LinkedIn API requests/responses
interface LinkedInShareContent {
  author: string;
  lifecycleState: string;
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: string;
      };
      shareMediaCategory: string;
    }
  };
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': string;
  };
}

interface LinkedInShareResponse {
  id: string;
}

/**
 * Post a text-only update to LinkedIn
 * 
 * @param accessToken LinkedIn access token
 * @param content Post content
 * @param visibility Visibility setting (PUBLIC or CONNECTIONS)
 * @returns Post ID if successful, null otherwise
 */
export async function postToLinkedIn(
  accessToken: string,
  content: string,
  visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'
): Promise<string | null> {
  try {
    // First, get the user's LinkedIn URN (unique resource name)
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    
    const authorUrn = `urn:li:person:${profileResponse.data.id}`;
    
    // Prepare the LinkedIn share content
    const shareContent: LinkedInShareContent = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility === 'PUBLIC' ? 'PUBLIC' : 'CONNECTIONS'
      }
    };

    // Make the LinkedIn API request to create a post
    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      shareContent,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    if (response.data && response.data.id) {
      // Return the ID of the created post
      return response.data.id;
    }

    return null;
  } catch (error) {
    console.error('Error posting to LinkedIn:', error);
    if (axios.isAxiosError(error)) {
      console.error('LinkedIn API error details:', error.response?.data);
      
      if (error.response?.status === 401) {
        throw new Error('LinkedIn authentication failed. Please reconnect your LinkedIn account.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to post to LinkedIn with this account.');
      } else if (error.response?.status === 429) {
        throw new Error('LinkedIn API rate limit exceeded. Please try again later.');
      }
    }
    throw new Error('Failed to post to LinkedIn');
  }
}

/**
 * Get the URL to a LinkedIn post
 */
export function getLinkedInPostUrl(postId: string): string {
  // Extract the activity ID from the post ID format
  // LinkedIn post IDs are typically in the format: "urn:li:share:1234567890"
  const activityId = postId.split(':').pop() || '';
  return `https://www.linkedin.com/feed/update/urn:li:activity:${activityId}`;
}

/**
 * Check if a LinkedIn access token is valid
 */
export async function verifyLinkedInToken(accessToken: string): Promise<boolean> {
  try {
    // Make a request to the LinkedIn API to verify the token
    const response = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('Error verifying LinkedIn token:', error);
    return false;
  }
}