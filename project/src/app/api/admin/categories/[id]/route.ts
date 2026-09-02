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
      return NextResponse.json({ success: false, error: 'Invalid category ID' }, { status: 400 });
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.name) updateData.name = body.name.trim();
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.sortOrder !== undefined) updateData.sortOrder = Number(body.sortOrder);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const updated = await db.updateCategory(id, updateData);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: updated,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ success: false, error: 'Failed to update category.' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Invalid category ID' }, { status: 400 });
    }

    const success = await db.deleteCategory(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete category.' }, { status: 500 });
  }
}