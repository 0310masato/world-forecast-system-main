import { NextResponse } from 'next/server';
import { getMockVessels, getMockWeather } from '@/lib/maritime/mock';
import { analyzeAllVessels } from '@/lib/maritime/analyzer';
import { calculateTensionIndex } from '@/lib/maritime/risk-index';
import { getMockNews } from '@/lib/maritime/news/mock-news';
import { toJapanBoundTankerRecords } from '@/lib/maritime/japan-bound';
import { saveJapanBoundTankerRecordsToNAS } from '@/lib/nas';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const now = Date.now();
    
    // In Phase 1, we use mock engines by default.
    // If future phases add external providers, they will be enabled via environment variables.
    const rawVessels = getMockVessels(now);
    const weather = getMockWeather(now);
    
    // Analyze vessels (estimating stop reasons, congestion, and AIS anomaly terminology)
    const vessels = analyzeAllVessels(rawVessels);
    
    // Get mock news to feed the tension index calculator
    const news = getMockNews(now);
    const tension = calculateTensionIndex(vessels, news, weather, now);
    const japanBoundTankers = toJapanBoundTankerRecords(vessels, true);
    const japanBoundTankerNasLog = await saveJapanBoundTankerRecordsToNAS(japanBoundTankers, now);
    
    return NextResponse.json({
      success: true,
      timestamp: now,
      vessels,
      weather,
      tension,
      japanBoundTankers,
      japanBoundTankerNasLog,
      isMock: true,
    });
  } catch (error: unknown) {
    console.error('API Error in /api/hormuz:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
