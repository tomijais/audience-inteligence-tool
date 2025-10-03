import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { getDataDir, planExists } from '@/app/lib/utils/storage';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; filename: string } }
) {
  try {
    const { id, filename } = params;

    // Security: only allow specific filenames
    const allowedFiles = ['ait.json', 'ait.md', 'ait.pdf'];
    if (!allowedFiles.includes(filename)) {
      return NextResponse.json(
        { error: 'File not allowed' },
        { status: 403 }
      );
    }

    // Check if plan exists
    const exists = await planExists(id);
    if (!exists) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    const filePath = join(getDataDir(id), filename);
    const content = await readFile(filePath);

    // Set content type based on file extension
    const contentTypes: Record<string, string> = {
      'ait.json': 'application/json',
      'ait.md': 'text/markdown',
      'ait.pdf': 'application/pdf',
    };

    return new NextResponse(new Uint8Array(content), {
      status: 200,
      headers: {
        'Content-Type': contentTypes[filename] || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);

    return NextResponse.json(
      {
        error: 'File not found',
        message: (error as Error).message,
      },
      { status: 404 }
    );
  }
}
