import { NextResponse } from 'next/server';
import { db } from '@/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await db.getSettings();
    return NextResponse.json(
      {
        success: true,
        settings,
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load store settings' },
      { status: 500 }
    );
  }
}