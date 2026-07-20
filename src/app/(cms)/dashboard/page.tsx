import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuthPage } from '@/features/auth/require-auth';
import { CmsShell } from '@/components/cms/layout/CmsShell';
import { DashboardWidgets } from '@/components/cms/shared/DashboardWidgets';

export default async function DashboardPage() {
  await requireAuthPage();

  // Load counts in parallel
  const [blogsCount, caseCount, pubBlogs, pubCases, logs] = await Promise.all([
    prisma.blogPost.count(),
    prisma.caseStudy.count(),
    prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
    prisma.caseStudy.count({ where: { publishedAt: { not: null } } }),
    prisma.activityLog.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })
  ]);

  const cards = [
    { label: 'Blog Posts Catalog', count: blogsCount, sub: `${pubBlogs} published to live`, iconType: 'blog' as const, bg: 'bg-rose-50 text-rose-600 border-rose-100 ring-1 ring-rose-100', accent: 'border-l-rose-400' },
    { label: 'Case Studies Catalog', count: caseCount, sub: `${pubCases} published to live`, iconType: 'case-study' as const, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-1 ring-emerald-100', accent: 'border-l-emerald-400' },
    { label: 'Combined Publications', count: blogsCount + caseCount, sub: 'Unified B2B content base', iconType: 'combined' as const, bg: 'bg-amber-50 text-amber-600 border-amber-100 ring-1 ring-amber-100', accent: 'border-l-amber-400' },
  ];

  // Map Prisma Log entries to expected serializable data contracts
  const serializableLogs = logs.map(log => ({
    id: log.id,
    action: log.action,
    details: log.details || '',
    createdAt: log.createdAt.toISOString(),
    user: {
      name: log.user.name
    }
  }));

  return (
    <CmsShell>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col gap-1 select-none pl-3 border-l-4 border-l-emerald-400">
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">Workspace Dashboard</h2>
          <p className="text-[11px] text-slate-455">Review editorial activity, aggregate publishing analytics, and write B2B content.</p>
        </div>

        {/* Catalog Dashboard widgets */}
        <DashboardWidgets cards={cards} logs={serializableLogs} />
      </div>
    </CmsShell>
  );
}

export const dynamic = 'force-dynamic';
