import React from 'react';
import { requireAuthPage } from '@/features/auth/require-auth';
import { CmsShell } from '@/components/cms/layout/CmsShell';
import { Cpu, Globe } from 'lucide-react';

export default async function LlmsSettingsPage() {
  await requireAuthPage();

  return (
    <CmsShell>
      <div className="space-y-6 select-none max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-slate-800">Generative AI Crawler (llms.txt)</h2>
            <p className="text-[11px] text-slate-450 mt-0.5">Control indexing specifications and crawler accessibility for LLMs and AI agents.</p>
          </div>
        </div>

        {/* Configurations Form */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2.5 border-b border-slate-100">
            <Cpu className="w-4.5 h-4.5 text-indigo-500" />
            Semantic LLM Map Overview
          </h3>

          <div className="space-y-3 text-xs leading-relaxed text-slate-600">
            <p>
              The CMS dynamically hosts an `llms.txt` crawler document mapping key takeaways, direct answer prompts, and reference sources. This helps search engine crawlers synthesize B2B reports and case studies accurately.
            </p>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
              <Globe className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="font-semibold text-slate-850">Public Endpoint</p>
                <code className="text-[10px] text-indigo-650 font-bold bg-white px-1.5 py-0.5 border border-indigo-100 rounded-sm">
                  GET /api/v1/public/llms
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CmsShell>
  );
}
export const dynamic = 'force-dynamic';
