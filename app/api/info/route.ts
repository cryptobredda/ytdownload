import { NextRequest, NextResponse } from 'next/server';
import { getVideoInfo } from '@/lib/ytdlp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const info = await getVideoInfo(url);
    return NextResponse.json(info);
  } catch (error: any) {
    console.error('Error fetching video info:', error);
    
    // Check if it's a yt-dlp error
    if (error.message && error.message.includes('yt-dlp')) {
      return NextResponse.json(
        { 
          error: 'yt-dlp is not available. This should not happen in Docker. Please rebuild the container.',
          setupRequired: true 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch video info' },
      { status: 500 }
    );
  }
}
