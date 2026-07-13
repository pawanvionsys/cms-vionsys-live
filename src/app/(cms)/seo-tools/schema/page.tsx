import React from 'react';
import { requireAuthPage } from '../../../../features/auth/require-auth';
import { CmsShell } from '../../../../components/cms/layout/CmsShell';
import { SchemaGenerator } from '../../../../features/seo/schema-generator';
import { Code2 } from 'lucide-react';

export default async function SchemaSettingsPage() {
  await requireAuthPage();
  const orgSchema = SchemaGenerator.getOrganizationSchema();

  return (
    <CmsShell>
      <div className="space-y-6 select-none">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-slate-800">Global JSON-LD Schema</h2>
            <p className="text-[11px] text-slate-450 mt-0.5">Inspect Google structure definitions loaded for organizations and websites.</p>
          </div>
        </div>

        {/* View Code */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Code2 className="w-4.5 h-4.5 text-indigo-500" />
            Global Organization Schema
          </h3>
          <div className="bg-slate-900 text-slate-200 p-5 rounded-xl font-mono text-xs max-w-xl leading-relaxed border border-slate-950">
            <pre>{JSON.stringify(orgSchema, null, 2)}</pre>
          </div>
        </div>
      </div>
    </CmsShell>
  );
}
export const dynamic = 'force-dynamic';
