import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuthPage } from '@/features/auth/require-auth';
import { CmsShell } from '@/components/cms/layout/CmsShell';
import { Redirect } from '@prisma/client';
import { ArrowRightLeft } from 'lucide-react';

export default async function RedirectsPage() {
  await requireAuthPage();
  const redirects = await prisma.redirect.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <CmsShell>
      <div className="space-y-6 select-none">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-slate-800">Legacy URL Redirects (301)</h2>
            <p className="text-[11px] text-slate-450 mt-0.5">Audit redirection rules registered when slug configurations are modified.</p>
          </div>
        </div>

        {/* Index Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-700">
            <ArrowRightLeft className="w-4.5 h-4.5 text-indigo-500" />
            Active Mappings ({redirects.length} rules)
          </div>
          
          {redirects.length === 0 ? (
            <div className="p-12 text-center text-slate-450 text-xs">
              No legacy redirects recorded in the database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-450 font-bold uppercase tracking-wider text-[9px]">
                    <th className="py-2.5 px-6">From Path</th>
                    <th className="py-2.5 px-4">To Destination Path</th>
                    <th className="py-2.5 px-4">Status Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {redirects.map((item: Redirect, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/30">
                      <td className="py-3 px-6 font-semibold text-rose-600">{item.fromPath}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-600">{item.toPath}</td>
                      <td className="py-3 px-4 font-bold">{item.statusCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CmsShell>
  );
}
export const dynamic = 'force-dynamic';
