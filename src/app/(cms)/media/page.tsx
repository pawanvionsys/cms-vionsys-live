import React from 'react';
import { requireAuthPage } from '../../../features/auth/require-auth';
import { CmsShell } from '../../../components/cms/layout/CmsShell';
import { MediaLibrary } from '../../../components/cms/media/MediaLibrary';

export default async function MediaPage() {
  await requireAuthPage();

  return (
    <CmsShell>
      <div className="space-y-4 select-none">
        <div>
          <h2 className="text-base font-bold text-slate-800">Media Library Explorer</h2>
          <p className="text-[11px] text-slate-450 mt-0.5">Upload, folder catalogs, search tags, compressions and alt text tags updates.</p>
        </div>
        <MediaLibrary />
      </div>
    </CmsShell>
  );
}
export const dynamic = 'force-dynamic';
