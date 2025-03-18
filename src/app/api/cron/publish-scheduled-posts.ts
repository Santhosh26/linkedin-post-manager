// src/app/api/cron/publish-scheduled-posts.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postToLinkedIn, getLinkedInPostUrl } from '@/lib/services/linkedin';

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
          continue;
        }
        
        const linkedInAccount = post.user.accounts[0];
        
        // Check if token is expired
        if (linkedInAccount.expires_at && linkedInAccount.expires_at * 1000 <= Date.now()) {
          console.log(`Skipping post ${post.id}: LinkedIn token expired`);
          results.skipped++;
          results.details.push({
            postId: post.id,
            status: 'skipped',
            message: 'LinkedIn token expired',
          });
          continue;
        }
        
        // Publish to LinkedIn
        console.log(`Publishing post ${post.id} to LinkedIn...`);
        const linkedinPostId = await postToLinkedIn(
          linkedInAccount.access_token,
          post.content,
          'PUBLIC' // Default to public visibility
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
      } catch (error) {
        console.error(`Error publishing post ${post.id}:`, error);
        results.failed++;
        results.details.push({
          postId: post.id,
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        
        // Optionally, mark the post as failed or keep it as scheduled
        // This depends on whether you want to retry failed posts
        // For now, we'll leave it as scheduled so it can be retried
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
  return GET(req);
}