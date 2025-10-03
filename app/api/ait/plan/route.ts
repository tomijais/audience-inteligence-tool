import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { generatePlan } from '@/app/lib/services/ait.service';
import { GeneratePlanRequestSchema } from '@/app/lib/schemas/ait.schema';
import { ValidationError } from '@/app/lib/utils/validation';
import { redactYAML } from '@/app/lib/utils/storage';

// Rate limiting map (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const limit = parseInt(process.env.RATE_LIMIT_MAX || '10');
  const window = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
  const now = Date.now();

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validatedRequest = GeneratePlanRequestSchema.parse(body);

    // Log redacted YAML
    console.log('Generating plan from YAML:', redactYAML(validatedRequest.yaml_input));

    // Generate plan
    const result = await generatePlan(
      validatedRequest.yaml_input,
      validatedRequest.options
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error generating plan:', error);

    // Handle different error types
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error,
        },
        { status: 422 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: error.message,
        },
        { status: 422 }
      );
    }

    if (error instanceof SyntaxError || (error as Error).message?.includes('YAML')) {
      return NextResponse.json(
        {
          error: 'Invalid YAML',
          message: (error as Error).message,
        },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
