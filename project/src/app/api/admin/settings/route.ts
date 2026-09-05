import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAdminApiRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = verifyAdminApiRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const settings = await db.getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to load settings.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = verifyAdminApiRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const allowedKeys = [
      'storeName',
      'logoType',
      'logoUrl',
      'phone',
      'whatsappNumber',
      'email',
      'address',
      'deliveryFee',
      'freeDeliveryThreshold',
      'isDeliveryActive',
      'easyPaisaTitle',
      'easyPaisaNumber',
      'meezanTitle',
      'meezanIban',
      'meezanAccount',
      'sadaPayTitle',
      'sadaPayNumber',
      'jazzCashTitle',
      'jazzCashNumber',
      'payPalEmail',
      'payPalInstructions',
      'manualPaymentInstructions',
      'announcementText',
      'isAnnouncementActive',
      'heroTitle',
      'heroSubtitle',
      'heroImageUrl',
    ];

    const cleanUpdate: any = {};
    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        cleanUpdate[key] = body[key];
      }
    }

    const updated = await db.updateSettings(cleanUpdate);
    return NextResponse.json({
      success: true,
      message: 'Store and bank settings updated successfully.',
      settings: updated,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings.' }, { status: 500 });
  }
}