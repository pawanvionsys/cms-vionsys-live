import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuthPage } from '@/features/auth/require-auth';
import { CmsShell } from '@/components/cms/layout/CmsShell';
import { SERVICES_LIST } from '@/config/taxonomy';
import { Layers } from 'lucide-react';

export default async function TaxonomySettingsPage() {
  await requireAuthPage();
  const categories = await prisma.category.findMany();

  return (
    <CmsShell>
      <div className="space-y-6 select-none max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-slate-800">Content Taxonomy & Tags</h2>
            <p className="text-[11px] text-slate-450 mt-0.5">Manage editorial categories and target B2B service identifiers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Layers className="w-4 h-4 text-indigo-500" />
              Active Categories ({categories.length})
            </h3>
            <div className="space-y-2">
              {categories.map(c => (
                <div key={c.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50/30 text-xs">
                  <p className="font-semibold text-slate-850">{c.name}</p>
                  <p className="text-slate-450 text-[10px] mt-0.5">{c.description || 'No description provided.'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Layers className="w-4 h-4 text-indigo-500" />
              Configured B2B Service IDs
            </h3>
            <div className="space-y-2">
              {SERVICES_LIST.map(s => (
                <div key={s.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-slate-50/30 text-xs leading-normal">
                  <span className="font-semibold text-slate-700">{s.label}</span>
                  <code className="bg-slate-100 text-[10px] px-1.5 py-0.5 rounded-sm font-semibold text-slate-500">{s.id}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CmsShell>
  );
}
export const dynamic = 'force-dynamic';
