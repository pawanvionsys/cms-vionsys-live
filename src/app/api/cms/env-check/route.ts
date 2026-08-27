import { NextRequest } from 'next/server';
import { requireAuth } from '@/features/auth/rbac';
import { getEnvDiagnostics } from '@/lib/env-diagnostics';
import { ApiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const revealSecrets =
      request.nextUrl.searchParams.get('reveal') === '1' &&
      process.env.NODE_ENV !== 'production';

    return ApiResponse.success(getEnvDiagnostics({ revealSecrets }));
  } catch (err: any) {
    if (err.status === 401 || err.name === 'AuthError') {
      return ApiResponse.unauthorized(err.message);
    }
    console.error('Env check error:', err);
    return ApiResponse.serverError('Failed to read environment diagnostics.', err.message);
  }
}

export const dynamic = 'force-dynamic';
