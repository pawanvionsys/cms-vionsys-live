import { NextRequest } from 'next/server';
import { CaseStudyService } from '../../../../features/case-studies/case-study.service';
import { requireAuth, authorizeUser } from '../../../../features/auth/rbac';
import { ApiResponse } from '../../../../lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const searchParams = request.nextUrl.searchParams;
    const industry = searchParams.get('industry') || undefined;
    const approvalStatus = searchParams.get('approvalStatus') || undefined;
    const engagementType = searchParams.get('engagementType') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await CaseStudyService.listCaseStudies({
      industry,
      approvalStatus,
      engagementType,
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
    console.error('API case-studies list error:', err);
    return ApiResponse.error(err.code || 'LIST_FAILED', err.message, err.details, err.status || 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await authorizeUser('content:create');
    const body = await request.json();

    const result = await CaseStudyService.createCaseStudy(session.userId, body);
    return ApiResponse.success(result, null, 212);
  } catch (err: any) {
    console.error('API case-study create error:', err);
    return ApiResponse.error(err.code || 'CREATE_FAILED', err.message, err.details, err.status || 400);
  }
}
export const dynamic = 'force-dynamic';
