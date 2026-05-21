import { NextResponse } from 'next/server';
import { getMockNews } from '@/lib/maritime/news/mock-news';

export async function GET() {
  try {
    const now = Date.now();
    
    // In Phase 1, we use mock news scenario feeds.
    const news = getMockNews(now);
    
    return NextResponse.json({
      success: true,
      timestamp: now,
      news,
      isMock: true,
    });
  } catch (error: unknown) {
    console.error('API Error in /api/hormuz/news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
