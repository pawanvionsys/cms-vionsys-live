import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuthPage } from '@/features/auth/require-auth';
import { CmsShell } from '@/components/cms/layout/CmsShell';
import { CaseStudyListTable } from '@/components/cms/shared/CaseStudyListTable';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function CaseStudiesListPage() {
  await requireAuthPage();

  const caseStudies = await prisma.caseStudy.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      author: true,
      resultStats: true
    }
  });

  return (
    <CmsShell>
      <div className="space-y-6 select-none">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-xl shadow-3xs">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Case Studies Catalog</h2>
            <p className="text-[11px] text-slate-455 mt-0.5">Build and publish repeatable B2B project outcome sheets without developer dependencies.</p>
          </div>
          <Link
            href="/case-studies/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active-press rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Case Study
          </Link>
        </div>

        {/* Catalog Table */}
        <CaseStudyListTable caseStudies={caseStudies} />
      </div>
    </CmsShell>
  );
}

export const dynamic = 'force-dynamic';
