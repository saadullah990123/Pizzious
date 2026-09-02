import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const categorySlug = new URL(request.url).searchParams.get('category') || undefined;
    const [categories, items] = await Promise.all([
      db.getCategories(),
      db.getMenuItems({ categorySlug, isActiveOnly: true }),
    ]);

    const activeCategories = categories.filter(c => c.isActive);

    return NextResponse.json(
      {
        success: true,
        categories: activeCategories,
        items,
        deals: items.filter(i => i.isDeal),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load menu data' },
      { status: 500 }
    );
  }
}