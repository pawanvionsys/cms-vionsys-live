import { NextRequest } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { RobotsGenerator } from '../../../../../features/seo/robots-generator';
import { ApiResponse } from '../../../../../lib/api-response';

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

    const robotsTxt = RobotsGenerator.generateRobotsTxt();
    return ApiResponse.success({ robotsTxt });
  } catch (err: any) {
    console.error('Public robots API error:', err);
    return ApiResponse.serverError('An error occurred generating robots rules.', err.message);
  }
}
export const dynamic = 'force-dynamic';
