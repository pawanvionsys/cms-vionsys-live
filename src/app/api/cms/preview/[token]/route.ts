import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { PreviewTokenService } from '../../../../../features/publishing/preview-token.service';
import { BlogMapper } from '../../../../../features/blogs/blog.mapper';
import { CaseStudyMapper } from '../../../../../features/case-studies/case-study.mapper';
import { ApiResponse } from '../../../../../lib/api-response';

function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-vionsys-cms-key',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(request),
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const corsHeaders = getCorsHeaders(request);
  const applyCors = (res: NextResponse) => {
    Object.entries(corsHeaders).forEach(([key, val]) => {
      res.headers.set(key, val);
    });
    return res;
  };

  try {
    const { token } = await params;
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // 'blog' or 'case-study'

    if (!id || !type) {
      return applyCors(
        ApiResponse.error('MISSING_PARAMS', 'Parameters "id" and "type" are required.', null, 400)
      );
    }

    // Verify token
    const isValid = PreviewTokenService.validateToken(id, token);
    if (!isValid) {
      return applyCors(ApiResponse.unauthorized('Invalid preview signature token.'));
    }

    if (type === 'blog') {
      const blog = await prisma.blogPost.findUnique({
        where: { id },
        include: {
          author: true,
          category: true,
          tags: true,
          seoMeta: true,
          aeoGeoMeta: true,
          schemaSettings: true
        }
      });
      if (!blog) return applyCors(ApiResponse.notFound('Blog post not found.'));
      return applyCors(ApiResponse.success(BlogMapper.toAdminJson(blog)));
    } else {
      const cs = await prisma.caseStudy.findUnique({
        where: { id },
        include: {
          author: true,
          resultStats: true,
          processSteps: true,
          mediaGallery: true,
          seoMeta: true,
          aeoGeoMeta: true,
          schemaSettings: true,
          faqs: true
        }
      });
      if (!cs) return applyCors(ApiResponse.notFound('Case study not found.'));
      return applyCors(ApiResponse.success(CaseStudyMapper.toAdminJson(cs)));
    }
  } catch (err: any) {
    console.error('Preview token validation error:', err);
    return applyCors(ApiResponse.serverError('An error occurred validating preview token.', err.message));
  }
}
export const dynamic = 'force-dynamic';
