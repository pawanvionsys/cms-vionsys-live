import { prisma } from '../../lib/prisma';
import { StorageAdapter } from './storage-adapter';
import { AppError } from '../../lib/errors';
import { MediaAssetUpdateInput } from './media.validation';

export class MediaService {
  static async listAssets(params: {
    folderId?: string | null;
    search?: string;
    tag?: string;
    page?: number;
    limit?: number;
  }) {
    const { folderId, search, tag, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (folderId !== undefined) {
      where.folderId = folderId;
    }
    if (tag) {
      where.tags = { has: tag };
    }
    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } },
        { caption: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, assets] = await Promise.all([
      prisma.mediaAsset.count({ where }),
      prisma.mediaAsset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      total,
      page,
      limit,
      assets
    };
  }

  static async createAsset(data: {
    filename: string;
    url: string;
    filepath: string;
    size: number;
    mimeType: string;
    width?: number;
    height?: number;
    folderId?: string | null;
  }) {
    return prisma.mediaAsset.create({
      data: {
        filename: data.filename,
        filepath: data.filepath,
        url: data.url,
        size: data.size,
        mimeType: data.mimeType,
        width: data.width || null,
        height: data.height || null,
        folderId: data.folderId || null,
        tags: []
      }
    });
  }

  static async updateAsset(id: string, input: MediaAssetUpdateInput) {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) throw new AppError('Media asset not found', 'NOT_FOUND', 404);

    return prisma.mediaAsset.update({
      where: { id },
      data: {
        alt: input.alt !== undefined ? input.alt : asset.alt,
        caption: input.caption !== undefined ? input.caption : asset.caption,
        tags: input.tags !== undefined ? input.tags : asset.tags,
        folderId: input.folderId !== undefined ? input.folderId : asset.folderId
      }
    });
  }

  static async deleteAsset(id: string) {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) throw new AppError('Media asset not found', 'NOT_FOUND', 404);

    // Remove from database
    await prisma.mediaAsset.delete({ where: { id } });

    // Clean up physical file
    await StorageAdapter.deleteFile(asset.filepath);

    return { success: true };
  }

  // --- Folder Management ---

  static async listFolders() {
    return prisma.mediaFolder.findMany({
      include: {
        _count: {
          select: { assets: true, children: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  static async createFolder(name: string, parentId?: string | null) {
    let parentPath = '';
    
    if (parentId) {
      const parent = await prisma.mediaFolder.findUnique({ where: { id: parentId } });
      if (!parent) throw new AppError('Parent folder not found', 'NOT_FOUND', 404);
      parentPath = parent.path;
    }

    const folderSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const fullPath = parentPath ? `${parentPath}/${folderSlug}` : `/${folderSlug}`;

    // Verify folder uniqueness
    const existing = await prisma.mediaFolder.findUnique({ where: { path: fullPath } });
    if (existing) {
      return existing; // Return existing if matches path
    }

    return prisma.mediaFolder.create({
      data: {
        name,
        parentId: parentId || null,
        path: fullPath
      }
    });
  }
}
