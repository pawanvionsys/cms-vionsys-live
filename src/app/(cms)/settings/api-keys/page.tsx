import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuthPage } from '@/features/auth/require-auth';
import { CmsShell } from '@/components/cms/layout/CmsShell';
import { Key, Eye } from 'lucide-react';

export default async function ApiKeysSettingsPage() {
  await requireAuthPage();
  const keys = await prisma.apiKey.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <CmsShell>
      <div className="space-y-6 select-none max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-slate-800">Public API Keys</h2>
            <p className="text-[11px] text-slate-450 mt-0.5">Manage token signatures used by the public website frontend to read content.</p>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Key className="w-4.5 h-4.5 text-indigo-500" />
            Registered API Keys ({keys.length})
          </div>
          
          {keys.length === 0 ? (
            <div className="p-6 text-xs text-slate-500 space-y-4">
              <p>No custom API keys registered in the database yet.</p>
              <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-lg font-semibold text-[10px] text-indigo-800 leading-relaxed max-w-lg">
                💡 Development Fallback Key: <code className="bg-indigo-50/50 px-1 py-0.5 rounded-sm">vionsys-cms-public-key-dev-2026</code> is active for testing integration queries from local servers.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-450 font-bold uppercase tracking-wider text-[9px]">
                    <th className="py-2.5 px-6">Name</th>
                    <th className="py-2.5 px-4">Key hash</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-655">
                  {keys.map(k => (
                    <tr key={k.id} className="hover:bg-slate-50/30">
                      <td className="py-3.5 px-6 font-semibold text-slate-800">{k.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 truncate max-w-[120px]">{k.keyHash}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${
                          k.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                            : 'bg-red-50 text-red-700 border-red-150'
                        }`}>
                          {k.isActive ? 'Active' : 'Revoked'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : 'Never'}
                      </td>
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
