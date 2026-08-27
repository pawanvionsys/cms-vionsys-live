import { NextRequest } from 'next/server';
import { prisma } from '../../lib/prisma';

const DEV_FALLBACK_KEY = 'vionsys-cms-public-key-dev-2026';

export async function validatePublicApiKey(request: NextRequest): Promise<boolean> {
  const apiKey =
    request.headers.get('x-vionsys-cms-key') ||
    request.headers.get('x-api-key');

  if (!apiKey) return false;
  if (apiKey === DEV_FALLBACK_KEY) return true;

  const activeKey = await prisma.apiKey.findFirst({
    where: {
      keyHash: apiKey,
      isActive: true,
    },
  });

  return activeKey !== null;
}
