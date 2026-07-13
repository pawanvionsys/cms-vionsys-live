import { NextRequest } from 'next/server';
import { MediaService } from '../../../../../features/media/media.service';
import { authorizeUser } from '../../../../../features/auth/rbac';
import { ApiResponse } from '../../../../../lib/api-response';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authorizeUser('media:upload');
    const { id } = await params;
    const body = await request.json();

    const result = await MediaService.updateAsset(id, body);
    return ApiResponse.success(result);
  } catch (err: any) {
    console.error('API media update error:', err);
    return ApiResponse.error(err.code || 'UPDATE_FAILED', err.message, err.details, err.status || 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authorizeUser('media:delete');
    const { id } = await params;

    await MediaService.deleteAsset(id);
    return ApiResponse.success({ message: 'Media asset deleted successfully.' });
  } catch (err: any) {
    console.error('API media delete error:', err);
    return ApiResponse.error(err.code || 'DELETE_FAILED', err.message, err.details, err.status || 400);
  }
}
export const dynamic = 'force-dynamic';
