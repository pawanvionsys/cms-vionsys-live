import { NextRequest } from 'next/server';
import { StorageAdapter } from '../../../../features/media/storage-adapter';
import { MediaService } from '../../../../features/media/media.service';
import { authorizeUser } from '../../../../features/auth/rbac';
import { ApiResponse } from '../../../../lib/api-response';

export async function POST(request: NextRequest) {
  try {
    await authorizeUser('media:upload');
    const formData = await request.formData();
    
    let files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      files = formData.getAll('file') as File[];
    }
    const folderId = formData.get('folderId') as string | null;

    if (!files || files.length === 0) {
      return ApiResponse.error('NO_FILES', 'No files were uploaded.', null, 400);
    }

    const savedAssets = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Save file physically to disk
      const { url, filepath } = await StorageAdapter.saveFile(
        buffer,
        file.name,
        file.type
      );

      // Create record in database
      const asset = await MediaService.createAsset({
        filename: file.name,
        url,
        filepath,
        size: file.size,
        mimeType: file.type,
        folderId: folderId || null
      });

      savedAssets.push(asset);
    }

    return ApiResponse.success({
      message: `${savedAssets.length} file(s) uploaded successfully.`,
      assets: savedAssets
    });
  } catch (err: any) {
    console.error('API upload error:', err);
    return ApiResponse.error(err.code || 'UPLOAD_FAILED', err.message, err.details, err.status || 400);
  }
}

export const dynamic = 'force-dynamic';
