import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuthPage } from '@/features/auth/require-auth';
import { ContentEditorShell } from '@/components/cms/editor/ContentEditorShell';
import { SERVICES_LIST, DEFAULT_CATEGORIES } from '@/config/taxonomy';
import { Category } from '@prisma/client';

export default async function NewBlogPage() {
  await requireAuthPage();

  let categories = await prisma.category.findMany();

  // Seed default categories if database catalog is empty for ease of dev use
  if (categories.length === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map(c => ({
        name: c.name,
        slug: c.name.toLowerCase(),
        description: c.description
      }))
    });
    categories = await prisma.category.findMany();
  }

  return (
    <ContentEditorShell
      contentType="blog"
      categories={categories.map((c: Category) => ({ id: c.id, name: c.name }))}
      services={SERVICES_LIST}
    />
  );
}
export const dynamic = 'force-dynamic';
