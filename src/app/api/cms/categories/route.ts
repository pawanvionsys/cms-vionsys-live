import { NextRequest } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { authorizeUser } from '../../../../features/auth/rbac';
import { ApiResponse } from '../../../../lib/api-response';
import { slugify } from '../../../../lib/slugify';

export async function POST(request: NextRequest) {
  try {
    const session = await authorizeUser('taxonomy:manage');
    const { name, description } = await request.json();

    if (!name || !name.trim()) {
      return ApiResponse.error('NAME_REQUIRED', 'Category name is required.', null, 400);
    }

    const slug = slugify(name);

    // Check if category already exists
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: name.trim(), mode: 'insensitive' } },
          { slug: { equals: slug, mode: 'insensitive' } }
        ]
      }
    });

    if (existing) {
      return ApiResponse.error('CATEGORY_EXISTS', 'A category with this name or slug already exists.', null, 400);
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description ? description.trim() : null
      }
    });

    // Log action
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: 'CATEGORY_CREATE',
        details: `Created category: "${category.name}"`
      }
    });

    return ApiResponse.success(category);
  } catch (err: any) {
    console.error('API create category error:', err);
    return ApiResponse.error(err.code || 'CREATE_FAILED', err.message, err.details, err.status || 400);
  }
}

export const dynamic = 'force-dynamic';
