import React from 'react';
import { requireAuthPage } from '@/features/auth/require-auth';
import { CmsShell } from '@/components/cms/layout/CmsShell';
import { siteConfig } from '@/config/site';
import { FormField } from '@/components/cms/shared/FormField';
import { Settings, Save } from 'lucide-react';

export default async function GeneralSettingsPage() {
  await requireAuthPage();

  return (
    <CmsShell>
      <div className="space-y-6 select-none max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-slate-800">General settings</h2>
            <p className="text-[11px] text-slate-450 mt-0.5">Customize publisher environment properties, corporate links, and branding parameters.</p>
          </div>
        </div>

        {/* Configurations Form */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-6 space-y-6">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2.5 border-b border-slate-100">
            <Settings className="w-4.5 h-4.5 text-indigo-500" />
            Branding & Organization Parameters
          </h3>

          <div className="space-y-4">
            <FormField label="Organization Branding Name">
              <input
                type="text"
                defaultValue={siteConfig.defaults.orgName}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
              />
            </FormField>

            <FormField label="Organization Website URL (Publish target)">
              <input
                type="url"
                defaultValue={siteConfig.defaults.orgUrl}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
              />
            </FormField>

            <FormField label="Organization Branding Logo (Google structured data logo)">
              <input
                type="url"
                defaultValue={siteConfig.defaults.orgLogoUrl}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
              />
            </FormField>

            <FormField label="Revalidation Webhook Receiver URL">
              <input
                type="url"
                defaultValue={siteConfig.revalidateUrl}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-slate-50/50"
              />
            </FormField>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </CmsShell>
  );
}
export const dynamic = 'force-dynamic';
