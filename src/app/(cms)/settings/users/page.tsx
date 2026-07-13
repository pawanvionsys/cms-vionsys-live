import React from 'react';
import { prisma } from '@/lib/prisma';
import { requireAuthPage } from '@/features/auth/require-auth';
import { CmsShell } from '@/components/cms/layout/CmsShell';
import { Users, ShieldAlert } from 'lucide-react';

export default async function UsersSettingsPage() {
  await requireAuthPage();
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <CmsShell>
      <div className="space-y-6 select-none max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-slate-800">User accounts & roles</h2>
            <p className="text-[11px] text-slate-450 mt-0.5">Manage permissions, invite writing staff, and audit editorial access credentials.</p>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Users className="w-4.5 h-4.5 text-indigo-500" />
            Registered Staff ({users.length} accounts)
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-450 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-2.5 px-6">Name</th>
                  <th className="py-2.5 px-4">Email Address</th>
                  <th className="py-2.5 px-4">Assigned Role</th>
                  <th className="py-2.5 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/30">
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{u.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase border bg-indigo-50 border-indigo-150 text-indigo-700 rounded-md">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
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
