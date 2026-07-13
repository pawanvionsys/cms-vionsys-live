import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { Redirect } from '@prisma/client';

async function validateApiKey(request: NextRequest): Promise<boolean> {
  const apiKey = request.headers.get('x-vionsys-cms-key');
  if (!apiKey) return false;
  if (apiKey === 'vionsys-cms-public-key-dev-2026') return true;

  const activeKey = await prisma.apiKey.findFirst({
    where: {
      keyHash: apiKey,
      isActive: true
    }
  });
  return activeKey !== null;
}

export async function GET(request: NextRequest) {
  try {
    const isValid = await validateApiKey(request);
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
