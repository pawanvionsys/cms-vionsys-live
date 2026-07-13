import { NextRequest } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { BlogMapper } from '../../../../../features/blogs/blog.mapper';
import { ApiResponse } from '../../../../../lib/api-response';

async function validateApiKey(request: NextRequest): Promise<boolean> {
  const apiKey = request.headers.get('x-vionsys-cms-key');
  if (!apiKey) return false;

  // Dev fallback
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
      return ApiResponse.unauthorized('Missing or invalid API Key in header "x-vionsys-cms-key".');
    }

    const blogs = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      include: {
        author: true,
        category: true,
        tags: true,
        seoMeta: true,
        aeoGeoMeta: true,
        schemaSettings: true
      }
    });

    const publicBlogs = blogs
      .map(BlogMapper.toPublicJson)
      .filter(Boolean); // Filter out null drafts

    return ApiResponse.success(publicBlogs);
  } catch (err: any) {
    console.error('Public blogs list API error:', err);
    return ApiResponse.serverError('An error occurred loading blogs data.', err.message);
  }
}
export const dynamic = 'force-dynamic';
