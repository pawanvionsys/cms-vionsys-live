import { NextRequest } from 'next/server';
import { removeSessionCookie } from '../../../../../features/auth/auth-options';
import { ApiResponse } from '../../../../../lib/api-response';

export async function POST(request: NextRequest) {
  try {
    await removeSessionCookie();
    return ApiResponse.success({ message: 'Signed out successfully.' });
  } catch (err: any) {
    console.error('Logout route error:', err);
    return ApiResponse.serverError('An error occurred during logout.', err.message);
  }
}
export const dynamic = 'force-dynamic';
