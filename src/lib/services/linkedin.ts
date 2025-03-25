// src/lib/services/linkedin.ts
import axios from 'axios';

interface LinkedInTokenInfo {
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
}

/**
 * Post a text-only update to LinkedIn
 * 
 * @param accessToken LinkedIn access token
 * @param content Post content
 * @param visibility Visibility setting (PUBLIC or CONNECTIONS)
 * @returns Post ID if successful
 */
export async function postToLinkedIn(
  accessToken: string,
  content: string,
  visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'
): Promise<string> {
  try {
    console.log('Posting content to LinkedIn with manual approach...');
    
    // Get user info first to get the sub value (person ID)
    try {
      const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      
      console.log('User info response:', JSON.stringify(userInfoResponse.data, null, 2));
      
      // If we have a sub value, use it to create the authorUrn
      if (userInfoResponse.data?.sub) {
        const sub = userInfoResponse.data.sub;
        console.log('Found LinkedIn ID:', sub);
        
        // Create the post payload with the authorUrn
        const postData = {
          author: `urn:li:person:${sub}`,
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
        
        console.log('Post data:', JSON.stringify(postData, null, 2));
        
        // Send the post request to LinkedIn
        const response = await axios.post(
          'https://api.linkedin.com/v2/ugcPosts',
          postData,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0'
            }
          }
        );
        
        console.log('Post response:', JSON.stringify(response.data, null, 2));
        
        if (response.data?.id) {
          const postId = response.data.id.split(':').pop() || '';
          return postId;
        }
      }
    } catch (error) {
      console.error('Error getting user info or posting:', error.response?.status, error.response?.data);
    }
    
    
    
    throw new Error('All posting methods failed. You may need to reconnect your LinkedIn account with the required scopes (openid, profile, email, w_member_social).');
  } catch (error) {
    console.error('Error posting to LinkedIn:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('LinkedIn API error details:', {
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 401) {
        throw new Error('LinkedIn authentication failed. Please reconnect your LinkedIn account.');
      } else if (error.response?.status === 403) {
        throw new Error('LinkedIn permission error. Your access token does not have the necessary permissions.');
      } else if (error.response?.status === 422) {
        throw new Error('LinkedIn validation error: ' + (error.response?.data?.message || 'Invalid request format'));
      } else if (error.response?.status === 429) {
        throw new Error('LinkedIn API rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 500) {
        throw new Error('LinkedIn server error. This might be a temporary issue. Please try again later.');
      }
    }
    
    throw new Error('Failed to post to LinkedIn: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Post content with an image to LinkedIn
 * 
 * @param accessToken LinkedIn access token
 * @param content Post content
 * @param imageUrl URL of the image to attach
 * @param visibility Visibility setting (PUBLIC or CONNECTIONS)
 * @returns Post ID if successful
 */
/**
 * Post content with an image to LinkedIn
 * 
 * @param accessToken LinkedIn access token
 * @param content Post content
 * @param imageUrl URL of the image to attach
 * @param visibility Visibility setting (PUBLIC or CONNECTIONS)
 * @returns Post ID if successful
 */
export async function postWithImageToLinkedIn(
  accessToken: string,
  content: string,
  image: {
    url: string;
    alt?: string;
  },
  visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'
): Promise<string> {
  try {
    // Get user info first to get the sub value (person ID)
    const userInfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    console.log('User info response:', JSON.stringify(userInfoResponse.data, null, 2));
    
    // If we have a sub value, use it to create the authorUrn
    if (userInfoResponse.data?.sub) {
      const sub = userInfoResponse.data.sub;
      console.log('Found LinkedIn ID:', sub);

      const registerImageResponse = await axios.post(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
          registerUploadRequest: {
            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
            owner: `urn:li:person:${sub}`,
            serviceRelationships: [
              {
                relationshipType: "OWNER",
                identifier: "urn:li:userGeneratedContent"
              }
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );
      const uploadUrl = registerImageResponse.data.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
      const assetUrn = registerImageResponse.data.value.asset;
      const imageResponse = await axios.get(image.url, { responseType: 'arraybuffer' });

      try {
        console.log(`Uploading image to LinkedIn: ${uploadUrl}`);
        await axios.put(uploadUrl, imageResponse.data, {
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        });
        console.log('Image uploaded successfully to LinkedIn');
      } catch (uploadError) {
        console.error('Error uploading image to LinkedIn:', uploadError);
        if (axios.isAxiosError(uploadError) && uploadError.response) {
          console.error('LinkedIn upload error details:', {
            status: uploadError.response.status,
            statusText: uploadError.response.statusText,
            data: uploadError.response.data
          });
        }
        throw new Error('Failed to upload image to LinkedIn');
      }
      
      // Create the post with the image
      console.log('Creating LinkedIn post with image:', assetUrn);
      const postData = {
        // Use the raw sub value without any transformation
        author: `urn:li:person:${sub}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: "IMAGE",
            media: [
              {
                status: "READY",
                description: {
                  text: image.alt || "Image"
                },
                media: assetUrn
              }
            ]
          }
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": visibility
        }
      };
      
      console.log('Post data:', JSON.stringify(postData, null, 2));
      
      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        postData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );
      
      if (response.data?.id) {
        const postId = response.data.id.split(':').pop() || '';
        return postId;
      } else {
        console.log("Failed to get post ID from LinkedIn response");
        throw new Error('Failed to get post ID from LinkedIn response');
      }
    } else {
      // No sub found in the response
      throw new Error('Could not determine LinkedIn user ID from response');
    }
  } catch (error) {
    console.error('Error posting with image to LinkedIn:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('LinkedIn API error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    throw error;
  }
}

/**
 * Refresh a LinkedIn access token
 * 
 * @param refreshToken LinkedIn refresh token
 * @returns New token info if successful, null otherwise
 */
export async function refreshLinkedInToken(refreshToken: string): Promise<LinkedInTokenInfo | null> {
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

export function getLinkedInPostUrl(postId: string): string {
  // LinkedIn post IDs are typically in the format: "urn:li:share:1234567890"
  // If the postId already includes the full URN, extract just the ID part
  const activityId = postId.includes(':') ? postId.split(':').pop() || '' : postId;
  return `https://www.linkedin.com/feed/update/urn:li:share:${activityId}`;
}