import { NextRequest } from 'next/server';
import { CaseStudyService } from '../../../../../features/case-studies/case-study.service';
import { requireAuth, authorizeUser } from '../../../../../features/auth/rbac';
import { ApiResponse } from '../../../../../lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const result = await CaseStudyService.getCaseStudyById(id);
    return ApiResponse.success(result);
  } catch (err: any) {
    console.error('API case-study fetch error:', err);
    return ApiResponse.error(err.code || 'FETCH_FAILED', err.message, err.details, err.status || 400);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await authorizeUser('content:edit');
    const { id } = await params;
    const body = await request.json();

    const result = await CaseStudyService.updateCaseStudy(id, session.userId, body);
    return ApiResponse.success(result);
  } catch (err: any) {
    console.error('API case-study update error:', err);
    return ApiResponse.error(err.code || 'UPDATE_FAILED', err.message, err.details, err.status || 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await authorizeUser('content:delete');
    const { id } = await params;

    await CaseStudyService.deleteCaseStudy(id, session.userId);
    return ApiResponse.success({ message: 'Case study deleted successfully.' });
  } catch (err: any) {
    console.error('API case-study delete error:', err);
    return ApiResponse.error(err.code || 'DELETE_FAILED', err.message, err.details, err.status || 400);
  }
}
export const dynamic = 'force-dynamic';
