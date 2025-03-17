// src/lib/services/linkedin.ts
import axios from 'axios';

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
    console.log('Starting LinkedIn post attempt...');
    
    // Let's try a completely different approach using LinkedIn's share URN
    // Based on LinkedIn documentation, we need a proper URN with numeric ID
    // Instead of trying to get the user's ID (which we don't have permission for),
    // let's use a more elegant solution
    
    // Sometimes LinkedIn API can use the access token to determine the author
    // Let's try a different API endpoint: v2/shares
    try {
      console.log('Trying to post using the v2/shares endpoint...');
      
      const sharePayload = {
        content: {
          contentEntities: [
            {
              entityLocation: `https://example.com/share/${Date.now()}`,
              title: 'LinkedIn Post Manager Share',
              description: content.substring(0, 100) + (content.length > 100 ? '...' : '')
            }
          ],
          title: 'Post from LinkedIn Post Manager',
          description: content
        },
        distribution: {
          linkedInDistributionTarget: {
            visibleToGuest: visibility === 'PUBLIC'
          }
        },
        owner: 'urn:li:person:self',
        subject: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        text: {
          text: content
        }
      };
      
      console.log('Share payload:', JSON.stringify(sharePayload, null, 2));
      
      const response = await axios.post(
        'https://api.linkedin.com/v2/shares',
        sharePayload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );
      
      console.log('Share response status:', response.status);
      console.log('Share response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.id) {
        const postId = response.data.id.split(':').pop() || '';
        return postId;
      }
    } catch (shareError: any) {
      console.log('Share endpoint error:', 
        shareError.response?.status,
        JSON.stringify(shareError.response?.data || {}, null, 2)
      );
    }
    
    // If the previous attempt failed, let's try a different approach
    // We can try using the organization API if we're possibly posting as an organization
    try {
      console.log('Trying to fetch organization ID...');
      
      const organizationsResponse = await axios.get('https://api.linkedin.com/v2/organizationAcls?q=roleAssignee', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      
      console.log('Organizations response:', JSON.stringify(organizationsResponse.data, null, 2));
      
      // Extract organization ID from the response if available
      const organizationId = organizationsResponse.data?.elements?.[0]?.organization;
      
      if (organizationId) {
        console.log('Found organization ID:', organizationId);
        
        // Try posting as this organization
        const orgPostPayload = {
          author: organizationId,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: content
              },
              shareMediaCategory: "NONE"
            }
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": visibility
          }
        };
        
        console.log('Organization post payload:', JSON.stringify(orgPostPayload, null, 2));
        
        const orgPostResponse = await axios.post(
          'https://api.linkedin.com/v2/ugcPosts',
          orgPostPayload,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0'
            }
          }
        );
        
        console.log('Organization post response:', JSON.stringify(orgPostResponse.data, null, 2));
        
        if (orgPostResponse.data && orgPostResponse.data.id) {
          const postId = orgPostResponse.data.id.split(':').pop() || '';
          return postId;
        }
      }
    } catch (orgError: any) {
      console.log('Organization approach error:', 
        orgError.response?.status,
        JSON.stringify(orgError.response?.data || {}, null, 2)
      );
    }
    
    // As an absolute fallback, generate a LinkedIn share URL that the user can open
    const shareUrl = generateLinkedInShareUrl(content);
    throw new Error(`Direct posting to LinkedIn failed. Please use this link to share manually: ${shareUrl}`);
  } catch (error) {
    console.error('Error posting to LinkedIn:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('LinkedIn API error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: JSON.stringify(error.response?.data || {}, null, 2)
      });
      
      if (error.response?.status === 401) {
        throw new Error('LinkedIn authentication failed. Please reconnect your LinkedIn account.');
      } else if (error.response?.status === 403) {
        const errorMessage = error.response.data?.message || '';
        throw new Error(`LinkedIn permission error: ${errorMessage}`);
      } else if (error.response?.status === 400 || error.response?.status === 422) {
        const errorMessage = error.response.data?.message || '';
        throw new Error(`LinkedIn validation error: ${errorMessage}`);
      } else if (error.response?.status === 429) {
        throw new Error('LinkedIn API rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 500) {
        throw new Error('LinkedIn server error. This might be a temporary issue. Please try again later.');
      }
    }
    
    throw error;
  }
}

/**
 * Generate a LinkedIn share URL for manual sharing
 */
function generateLinkedInShareUrl(content: string): string {
  const encodedText = encodeURIComponent(content);
  return `https://www.linkedin.com/sharing/share-offsite/?url=https://example.com&title=Share&summary=${encodedText}`;
}

/**
 * Post content with an image to LinkedIn
 * 
 * @param accessToken LinkedIn access token
 * @param content Post content
 * @param imageUrl URL of the image to attach
 * @param visibility Visibility setting (PUBLIC or CONNECTIONS)
 * @returns Post ID if successful, null otherwise
 */
export async function postWithImageToLinkedIn(
  accessToken: string,
  content: string,
  imageUrl: string,
  visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'
): Promise<string | null> {
  try {
    // This is a simplified example - LinkedIn requires a multi-step process to upload media
    console.log('Image sharing would be implemented here with URL:', imageUrl);
    
    // For now, fall back to regular text sharing
    return postToLinkedIn(accessToken, content, visibility);
  } catch (error) {
    console.error('Error posting with image to LinkedIn:', error);
    throw new Error('Failed to post image to LinkedIn: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Get the URL to a LinkedIn post
 */
export function getLinkedInPostUrl(postId: string): string {
  // LinkedIn post IDs are typically in the format: "urn:li:share:1234567890"
  // If the postId already includes the full URN, extract just the ID part
  const activityId = postId.includes(':') ? postId.split(':').pop() || '' : postId;
  return `https://www.linkedin.com/feed/update/urn:li:share:${activityId}`;
}

/**
 * Check if a LinkedIn access token is valid
 */
export async function verifyLinkedInToken(accessToken: string): Promise<boolean> {
  try {
    // Instead of calling /me which we don't have permission for,
    // let's try a simpler approach - try to get organization info
    // which might require fewer permissions
    const response = await axios.get('https://api.linkedin.com/v2/organizationAcls?q=roleAssignee', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    
    return response.status === 200;
  } catch (error) {
    // If we get a 403, the token might be valid but lacks permissions
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return true;
    }
    
    // For other errors, consider the token invalid
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return false;
    }
    
    // For any other error, log it and return false
    console.error('Error verifying LinkedIn token:', error);
    return false;
  }
}

/**
 * Refresh a LinkedIn access token
 * 
 * @param refreshToken LinkedIn refresh token
 * @returns New token info if successful, null otherwise
 */
export async function refreshLinkedInToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
} | null> {
  try {
    // LinkedIn token refresh requires client ID and secret
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('LinkedIn client credentials not configured');
      return null;
    }
    
    console.log('Refreshing LinkedIn token...');
    
    const response = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      null,
      {
        params: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    if (response.data && response.data.access_token) {
      return {
        accessToken: response.data.access_token,
        expiresAt: Date.now() + (response.data.expires_in * 1000),
        refreshToken: response.data.refresh_token
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error refreshing LinkedIn token:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('LinkedIn API error details:', error.response.data);
    }
    return null;
  }
}