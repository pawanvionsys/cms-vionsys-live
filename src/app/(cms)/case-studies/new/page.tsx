import React from 'react';
import { requireAuthPage } from '@/features/auth/require-auth';
import { ContentEditorShell } from '@/components/cms/editor/ContentEditorShell';
import { SERVICES_LIST } from '@/config/taxonomy';

export default async function NewCaseStudyPage() {
  await requireAuthPage();

  return (
    <ContentEditorShell
      contentType="case-study"
      categories={[]}
      services={SERVICES_LIST}
    />
  );
}
export const dynamic = 'force-dynamic';
