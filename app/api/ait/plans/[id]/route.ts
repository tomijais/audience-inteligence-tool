import { NextRequest, NextResponse } from 'next/server';
import { loadPlan, planExists } from '@/app/lib/utils/storage';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const exists = await planExists(id);
    if (!exists) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    const { json, markdown, pdfExists } = await loadPlan(id);

    const response: any = {
      json,
      markdown,
      id,
    };

    if (pdfExists) {
      response.pdf_url = `/files/${id}/ait.pdf`;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error loading plan:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
