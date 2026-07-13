import { NextRequest } from 'next/server';
import { BlogService } from '../../../../features/blogs/blog.service';
import { requireAuth, authorizeUser } from '../../../../features/auth/rbac';
import { ApiResponse } from '../../../../lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const authorId = searchParams.get('authorId') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await BlogService.listBlogs({
      status,
      categoryId,
      authorId,
      search,
      page,
      limit
    });

    return ApiResponse.success(result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (err: any) {
    console.error('API blogs list error:', err);
    return ApiResponse.error(err.code || 'LIST_FAILED', err.message, err.details, err.status || 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await authorizeUser('content:create');
    const body = await request.json();

    const result = await BlogService.createBlog(session.userId, body);
    return ApiResponse.success(result, null, 212);
  } catch (err: any) {
    console.error('API blog create error:', err);
    return ApiResponse.error(err.code || 'CREATE_FAILED', err.message, err.details, err.status || 400);
  }
}
export const dynamic = 'force-dynamic';
