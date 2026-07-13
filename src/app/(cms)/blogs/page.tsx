import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuthPage } from '@/features/auth/require-auth';
import { CmsShell } from '@/components/cms/layout/CmsShell';
import { BlogListTable } from '@/components/cms/shared/BlogListTable';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function BlogsListPage() {
  await requireAuthPage();

  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      author: true,
      category: true
    }
  });

  return (
    <CmsShell>
      <div className="space-y-6 select-none">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-xl shadow-3xs">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Blog Posts Catalog</h2>
            <p className="text-[11px] text-slate-455 mt-0.5">Writers and editors can draft and publish articles directly to vionsys.com.</p>
          </div>
          <Link
            href="/blogs/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active-press rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Blog Post
          </Link>
        </div>

        {/* Embedded Interactive Table */}
        <BlogListTable posts={posts} />
      </div>
    </CmsShell>
  );
}

export const dynamic = 'force-dynamic';
