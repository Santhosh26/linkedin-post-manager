// src/app/api/cron/publish-scheduled-posts/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postToLinkedIn, getLinkedInPostUrl, refreshLinkedInToken } from '@/lib/services/linkedin';
import { createNotification } from '@/lib/services/notification';

// Authentication for the cron job to prevent unauthorized access
const validateCronSecret = (req: Request) => {
  // Get the secret from the request header
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const cronSecret = process.env.CRON_SECRET;
  
  // Verify the secret matches the environment variable
  return token === cronSecret;
};

export const maxDuration = 300; // 5 minute timeout for Vercel

export async function GET(req: Request) {
  try {
    // Skip secret validation in development
    if (process.env.NODE_ENV !== 'development') {
      if (!validateCronSecret(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    console.log('Starting scheduled post publishing job...');
    
    // Get current time
    const now = new Date();
    
    // Find all posts that are scheduled and whose scheduledFor time has passed
    const postsToPublish = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        user: {
          include: {
            accounts: {
              where: {
                provider: 'linkedin',
              },
              select: {
                id: true,
                access_token: true,
                expires_at: true,
                refresh_token: true,
              },
            },
          },
        },
      },
    });
    
    console.log(`Found ${postsToPublish.length} posts to publish`);
    
    // Track successful and failed publications
    const results = {
      total: postsToPublish.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{
        postId: string;
        status: 'success' | 'failed' | 'skipped';
        message?: string;
      }>,
    };
    
    // Process each post
    for (const post of postsToPublish) {
      try {
        // Check if user has a valid LinkedIn connection
        if (!post.user.accounts || post.user.accounts.length === 0) {
          console.log(`Skipping post ${post.id}: User does not have a LinkedIn account connected`);
          results.skipped++;
          results.details.push({
            postId: post.id,
            status: 'skipped',
            message: 'User does not have a LinkedIn account connected',
          });
          
          // Create notification for the user
          await createNotification(
            post.userId,
            'SCHEDULED_POST_FAILED',
            'Failed to publish scheduled post: LinkedIn account not connected.',
            {
              postId: post.id,
              scheduledTime: post.scheduledFor?.toISOString(),
            }
          );
          continue;
        }
        
        const linkedInAccount = post.user.accounts[0];
        
        // Check if token is expired and try to refresh it
        let accessToken = linkedInAccount.access_token;
        if (linkedInAccount.expires_at && linkedInAccount.expires_at * 1000 <= Date.now()) {
          // Attempt to refresh the token if refresh token exists
          if (linkedInAccount.refresh_token) {
            console.log(`LinkedIn token expired for post ${post.id}, attempting to refresh...`);
            const refreshedToken = await refreshLinkedInToken(linkedInAccount.refresh_token);
            
            if (refreshedToken) {
              console.log(`Successfully refreshed LinkedIn token for post ${post.id}`);
              // Update the account with refreshed token
              await prisma.account.update({
                where: { id: linkedInAccount.id },
                data: {
                  access_token: refreshedToken.accessToken,
                  expires_at: Math.floor(refreshedToken.expiresAt / 1000),
                  refresh_token: refreshedToken.refreshToken || linkedInAccount.refresh_token,
                }
              });
              
              // Use the new access token
              accessToken = refreshedToken.accessToken;
            } else {
              // Token refresh failed - skip this post
              console.log(`Failed to refresh LinkedIn token for post ${post.id}`);
              results.skipped++;
              results.details.push({
                postId: post.id,
                status: 'skipped',
                message: 'LinkedIn token expired and refresh failed',
              });
              
              // Create notification for the user
              await createNotification(
                post.userId,
                'SCHEDULED_POST_FAILED',
                'Failed to publish scheduled post: LinkedIn authorization expired. Please reconnect your LinkedIn account.',
                {
                  postId: post.id,
                  scheduledTime: post.scheduledFor?.toISOString(),
                }
              );
              continue;
            }
          } else {
            // No refresh token - skip this post
            console.log(`Skipping post ${post.id}: LinkedIn token expired and no refresh token available`);
            results.skipped++;
            results.details.push({
              postId: post.id,
              status: 'skipped',
              message: 'LinkedIn token expired and no refresh token available',
            });
            
            // Create notification for the user
            await createNotification(
              post.userId,
              'SCHEDULED_POST_FAILED',
              'Failed to publish scheduled post: LinkedIn authorization expired. Please reconnect your LinkedIn account.',
              {
                postId: post.id,
                scheduledTime: post.scheduledFor?.toISOString(),
              }
            );
            continue;
          }
        }
        
        // Publish to LinkedIn with the proper visibility setting
        console.log(`Publishing post ${post.id} to LinkedIn...`);
        const linkedinPostId = await postToLinkedIn(
          accessToken,
          post.content,
          (post.visibility as 'PUBLIC' | 'CONNECTIONS') || 'PUBLIC'
        );
        
        // Get the LinkedIn post URL
        const linkedinPostUrl = getLinkedInPostUrl(linkedinPostId);
        
        // Update the post in the database
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: now,
            linkedinPostId,
            linkedinPostUrl,
          },
        });
        
        console.log(`Successfully published post ${post.id} to LinkedIn`);
        results.successful++;
        results.details.push({
          postId: post.id,
          status: 'success',
        });
        
        // Create success notification for the user
        await createNotification(
          post.userId,
          'SCHEDULED_POST_PUBLISHED',
          'Your scheduled post was published to LinkedIn successfully!',
          {
            postId: post.id,
            linkedinPostUrl,
          }
        );
      } catch (error) {
        console.error(`Error publishing post ${post.id}:`, error);
        results.failed++;
        results.details.push({
          postId: post.id,
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        
        // Create failure notification for the user
        await createNotification(
          post.userId,
          'SCHEDULED_POST_FAILED',
          'Failed to publish your scheduled post to LinkedIn.',
          {
            postId: post.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            scheduledTime: post.scheduledFor?.toISOString(),
          }
        );
      }
    }
    
    // Return summary of the operation
    return NextResponse.json({
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error('Error in scheduled post publishing job:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process scheduled posts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Optional: Also add a POST endpoint for manual triggering with proper authentication
export async function POST(req: Request) {
  // For manual triggering, we always validate the secret
  if (!validateCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return GET(req);
}