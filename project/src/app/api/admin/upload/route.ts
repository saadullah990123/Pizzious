import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminApiRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Client-side optimization is the primary compression path; this server guard
// prevents oversized files from being stored if the endpoint is called directly.
const MAX_FILE_SIZE_BYTES = 200 * 1024;
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req: NextRequest) {
  const session = verifyAdminApiRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    const extension = ALLOWED_MIME_TYPES[file.type];
    if (!extension) {
      return NextResponse.json(
        { success: false, error: 'Unsupported image type. Use JPG, PNG, WEBP, or GIF.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Image is too large. Images must be under 200KB.' },
        { status: 413 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, bytes);

    const url = `/uploads/${uniqueName}`;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ success: false, error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
