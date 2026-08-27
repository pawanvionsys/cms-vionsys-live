import { NextRequest } from 'next/server';
import { SitemapGenerator } from '../../../../../features/seo/sitemap-generator';
import { ApiResponse } from '../../../../../lib/api-response';
import { validatePublicApiKey } from '../../../../../features/auth/validate-public-api-key';

export async function GET(request: NextRequest) {
  try {
    const isValid = await validatePublicApiKey(request);
    if (!isValid) {
      return ApiResponse.unauthorized('Missing or invalid API Key.');
    }

    const sitemapData = await SitemapGenerator.generateSitemapData();
    return ApiResponse.success(sitemapData);
  } catch (err: any) {
    console.error('Public sitemap API error:', err);
    return ApiResponse.serverError('An error occurred generating sitemap content.', err.message);
  }
}
export const dynamic = 'force-dynamic';
