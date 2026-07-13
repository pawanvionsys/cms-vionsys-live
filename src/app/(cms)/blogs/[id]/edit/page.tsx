import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuthPage } from '@/features/auth/require-auth';
import { ContentEditorShell } from '@/components/cms/editor/ContentEditorShell';
import { SERVICES_LIST } from '@/config/taxonomy';
import { BlogMapper } from '@/features/blogs/blog.mapper';
import { Category } from '@prisma/client';

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  await requireAuthPage();
  const { id } = await params;

  // Retrieve post details with relations
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

  if (!blog) {
    notFound();
  }

  const categories = await prisma.category.findMany();
  const initialData = BlogMapper.toAdminJson(blog);

  return (
    <ContentEditorShell
      id={id}
      initialData={initialData}
      contentType="blog"
      categories={categories.map((c: Category) => ({ id: c.id, name: c.name }))}
      services={SERVICES_LIST}
    />
  );
}
export const dynamic = 'force-dynamic';
