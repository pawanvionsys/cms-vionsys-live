import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuthPage } from '@/features/auth/require-auth';
import { ContentEditorShell } from '@/components/cms/editor/ContentEditorShell';
import { SERVICES_LIST } from '@/config/taxonomy';
import { CaseStudyMapper } from '@/features/case-studies/case-study.mapper';

interface EditCaseStudyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCaseStudyPage({ params }: EditCaseStudyPageProps) {
  await requireAuthPage();
  const { id } = await params;

  // Retrieve case study detail with relationships
  const cs = await prisma.caseStudy.findUnique({
    where: { id },
    include: {
      author: true,
      resultStats: true,
      processSteps: true,
      mediaGallery: true,
      seoMeta: true,
      aeoGeoMeta: true,
      schemaSettings: true,
      faqs: true,
      versions: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!cs) {
    notFound();
  }

  const initialData = CaseStudyMapper.toAdminJson(cs);

  return (
    <ContentEditorShell
      id={id}
      initialData={initialData}
      contentType="case-study"
      categories={[]}
      services={SERVICES_LIST}
    />
  );
}
export const dynamic = 'force-dynamic';
