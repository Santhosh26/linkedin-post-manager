//src\app\api\images\route.ts
import { NextResponse } from 'next/server';
import { searchImages, getRandomImages } from '@/lib/services/unsplash';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const random = searchParams.get('random') === 'true';

    if (!query) {
      return NextResponse.json(
        { message: 'Query parameter is required' },
        { status: 400 }
      );
    }

    let images;
    if (random) {
      images = await getRandomImages(query, 5);
    } else {
      images = await searchImages(query, page);
    }

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { message: 'Error fetching images' },
      { status: 500 }
    );
  }
}