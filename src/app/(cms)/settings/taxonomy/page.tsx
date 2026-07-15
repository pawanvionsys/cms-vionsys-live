import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuthPage } from '@/features/auth/require-auth';
import { CmsShell } from '@/components/cms/layout/CmsShell';
import { SERVICES_LIST } from '@/config/taxonomy';
import { Layers } from 'lucide-react';
import { CategoryManager } from '@/components/cms/shared/CategoryManager';

export default async function TaxonomySettingsPage() {
  await requireAuthPage();
  
  // Fetch active categories
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <CmsShell>
      <div className="space-y-6 select-none max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-slate-800">Content Taxonomy & Tags</h2>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Manage editorial categories and target B2B service identifiers.</p>
          </div>
        </div>

        {/* Dynamic Category Manager */}
        <CategoryManager initialCategories={categories} />

        {/* Static B2B Service Identifiers Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Layers className="w-4 h-4 text-indigo-500" />
            Configured B2B Service IDs
          </h3>
          <p className="text-[11px] text-slate-450 leading-relaxed max-w-2xl">
            These IDs are used to programmatically link Blog Posts and Case Studies to specific core B2B service pages on your main website.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SERVICES_LIST.map(s => (
              <div key={s.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-slate-50/30 text-xs leading-normal">
                <span className="font-semibold text-slate-700">{s.label}</span>
                <code className="bg-slate-100 text-[10px] px-1.5 py-0.5 rounded-sm font-semibold text-slate-500">{s.id}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CmsShell>
  );
}

export const dynamic = 'force-dynamic';
