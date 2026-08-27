import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { Redirect } from '@prisma/client';
import { validatePublicApiKey } from '@/features/auth/validate-public-api-key';

export async function GET(request: NextRequest) {
  try {
    const isValid = await validatePublicApiKey(request);
    if (!isValid) {
      return ApiResponse.unauthorized('Missing or invalid API Key.');
    }

    const redirects = await prisma.redirect.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const mappedRedirects = redirects.map((r: Redirect) => ({
      fromPath: r.fromPath,
      toPath: r.toPath,
      statusCode: r.statusCode
    }));

    return ApiResponse.success(mappedRedirects);
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Public redirects API error:', error);
    return ApiResponse.serverError('An error occurred loading redirects data.', error.message);
  }
}
export const dynamic = 'force-dynamic';
