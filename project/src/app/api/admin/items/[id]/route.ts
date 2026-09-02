import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdminApiRequest } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = verifyAdminApiRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid item ID' }, { status: 400 });
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.name) updateData.name = body.name.trim();
    if (body.categoryId !== undefined) updateData.categoryId = Number(body.categoryId);
    if (body.description !== undefined) updateData.description = String(body.description);
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.salePrice !== undefined) updateData.salePrice = body.salePrice ? Number(body.salePrice) : null;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.isDeal !== undefined) updateData.isDeal = Boolean(body.isDeal);
    if (body.dealItems !== undefined) updateData.dealItems = body.dealItems;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured);
    if (body.isBestseller !== undefined) updateData.isBestseller = Boolean(body.isBestseller);
    if (body.stock !== undefined) updateData.stock = Number(body.stock);

    const updated = await db.updateMenuItem(id, updateData);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Item updated successfully',
      item: updated,
    });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = verifyAdminApiRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid item ID' }, { status: 400 });
    }

    const success = await db.deleteMenuItem(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 });
  }
}