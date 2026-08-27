import { NextRequest } from 'next/server';
import { RobotsGenerator } from '../../../../../features/seo/robots-generator';
import { ApiResponse } from '../../../../../lib/api-response';
import { validatePublicApiKey } from '../../../../../features/auth/validate-public-api-key';

export async function GET(request: NextRequest) {
  try {
    const isValid = await validatePublicApiKey(request);
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
