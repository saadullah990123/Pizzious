import { NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET() {
  try {
    const settings = await db.getSettings();
    return NextResponse.json(
      {
        success: true,
        settings,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load store settings' },
      { status: 500 }
    );
  }
}