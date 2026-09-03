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
    const items = await db.getMenuItems({ isActiveOnly: false });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching admin items:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch items.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = verifyAdminApiRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      categoryId,
      name,
      description,
      price,
      salePrice,
      images,
      isDeal,
      dealItems,
      isActive,
      isFeatured,
      isBestseller,
      stock,
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Item name is required.' }, { status: 400 });
    }

    if (!categoryId || isNaN(Number(categoryId))) {
      return NextResponse.json({ success: false, error: 'Valid category ID is required.' }, { status: 400 });
    }

    const numericCategoryId = Number(categoryId);
    const category = await db.getCategoryById(numericCategoryId);
    if (!category) {
      return NextResponse.json({ success: false, error: 'The selected category no longer exists. Please refresh and choose another category.' }, { status: 400 });
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return NextResponse.json({ success: false, error: 'Price must be a valid positive number.' }, { status: 400 });
    }

    const numericSalePrice = salePrice === null || salePrice === undefined || salePrice === ''
      ? null
      : Number(salePrice);
    if (numericSalePrice !== null && (!Number.isFinite(numericSalePrice) || numericSalePrice < 0)) {
      return NextResponse.json({ success: false, error: 'Sale price must be a valid positive number.' }, { status: 400 });
    }

    const numericStock = stock === undefined || stock === '' ? 100 : Number(stock);
    if (!Number.isInteger(numericStock) || numericStock < 0) {
      return NextResponse.json({ success: false, error: 'Stock quantity must be a whole number of 0 or more.' }, { status: 400 });
    }

    const baseSlug = slugify(name);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const newItem = await db.createMenuItem({
      categoryId: numericCategoryId,
      name: name.trim(),
      slug: uniqueSlug,
      description: description ? String(description).trim() : '',
      price: numericPrice,
      salePrice: numericSalePrice,
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80'],
      isDeal: Boolean(isDeal),
      dealItems: Array.isArray(dealItems) ? dealItems : [],
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      isFeatured: Boolean(isFeatured),
      isBestseller: Boolean(isBestseller),
      stock: numericStock,
    });

    return NextResponse.json({
      success: true,
      message: 'Menu item created successfully',
      item: newItem,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error && error.message
        ? `Failed to create menu item: ${error.message}`
        : 'Failed to create menu item. Please verify the category and values, then try again.',
    }, { status: 500 });
  }
}