import { NextRequest } from 'next/server';
import { clearSessionCookie } from '../../../../../features/auth/auth-options';
import { ApiResponse } from '../../../../../lib/api-response';

export async function POST(_request: NextRequest) {
  try {
    const response = ApiResponse.success({ message: 'Signed out successfully.' });
    return clearSessionCookie(response);
  } catch (err: any) {
    console.error('Logout route error:', err);
    return ApiResponse.serverError('An error occurred during logout.', err.message);
  }
}
export const dynamic = 'force-dynamic';
