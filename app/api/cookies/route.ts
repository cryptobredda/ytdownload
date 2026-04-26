import { NextRequest, NextResponse } from 'next/server';
import { getCookiesPath, hasCookies } from '@/lib/ytdlp';
import fs from 'fs';

export async function GET() {
  return NextResponse.json({ hasCookies: hasCookies() });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('cookies') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();

    if (!text.includes('.youtube.com')) {
      return NextResponse.json(
        { error: 'File does not appear to contain YouTube cookies. Export cookies from your browser while logged into YouTube.' },
        { status: 400 }
      );
    }

    fs.writeFileSync(getCookiesPath(), text, 'utf-8');

    return NextResponse.json({ success: true, hasCookies: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to upload cookies' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookiesPath = getCookiesPath();
    if (fs.existsSync(cookiesPath)) {
      fs.unlinkSync(cookiesPath);
    }
    return NextResponse.json({ success: true, hasCookies: false });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete cookies' },
      { status: 500 }
    );
  }
}
