import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdminApiRequest } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const session = verifyAdminApiRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const categories = await db.getCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: 'Failed to load categories.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = verifyAdminApiRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, icon, sortOrder, isActive } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Category name is required.' }, { status: 400 });
    }

    const slug = slugify(name);
    const newCategory = await db.createCategory({
      name: name.trim(),
      slug: `${slug}-${Date.now().toString(36)}`,
      icon: icon || 'Utensils',
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category: newCategory,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ success: false, error: 'Failed to create category.' }, { status: 500 });
  }
}