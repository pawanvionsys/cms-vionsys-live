import React from 'react';
import { requireAuthPage } from '../../../../features/auth/require-auth';
import { CmsShell } from '../../../../components/cms/layout/CmsShell';
import { SitemapGenerator } from '../../../../features/seo/sitemap-generator';
import { Globe, RefreshCw } from 'lucide-react';

export default async function SitemapPage() {
  await requireAuthPage();
  const sitemapItems = await SitemapGenerator.generateSitemapData();

  return (
    <CmsShell>
      <div className="space-y-6 select-none">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-slate-800">XML Sitemap Index</h2>
            <p className="text-[11px] text-slate-450 mt-0.5">Manage search engine crawler indexes and inspect active sitemap pathways.</p>
          </div>
        </div>

        {/* Index Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Globe className="w-4.5 h-4.5 text-indigo-500" />
            Index Map ({sitemapItems.length} active URLs)
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-450 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-2.5 px-6">Location URL</th>
                  <th className="py-2.5 px-4">Frequency</th>
                  <th className="py-2.5 px-4">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {sitemapItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30">
                    <td className="py-3 px-6 font-semibold text-slate-850">{item.url}</td>
                    <td className="py-3 px-4 capitalize">{item.changefreq || 'weekly'}</td>
                    <td className="py-3 px-4 font-bold">{item.priority || 0.6}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CmsShell>
  );
}
export const dynamic = 'force-dynamic';
