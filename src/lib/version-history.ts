import type { Prisma } from '@prisma/client';
import { prisma } from './prisma';

const MAX_VERSIONS = 20;

type VersionScope =
  | { blogPostId: string; caseStudyId?: never }
  | { caseStudyId: string; blogPostId?: never };

async function trimVersionHistory(scope: VersionScope) {
  const versions = await prisma.versionHistory.findMany({
    where: scope,
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });

  if (versions.length <= MAX_VERSIONS) return;

  await prisma.versionHistory.deleteMany({
    where: {
      id: { in: versions.slice(MAX_VERSIONS).map((version) => version.id) },
    },
  });
}

export async function recordBlogVersionHistory(input: {
  blogPostId: string;
  authorId: string;
  contentJson: Prisma.InputJsonValue;
  contentHtml: string;
}) {
  await prisma.versionHistory.create({
    data: {
      blogPostId: input.blogPostId,
      contentJson: input.contentJson,
      contentHtml: input.contentHtml,
      authorId: input.authorId,
    },
  });

  await trimVersionHistory({ blogPostId: input.blogPostId });
}

export async function recordCaseStudyVersionHistory(input: {
  caseStudyId: string;
  authorId: string;
  challengeJson: Prisma.InputJsonValue;
  approachJson: Prisma.InputJsonValue;
  challengeHtml: string;
  approachHtml: string;
}) {
  await prisma.versionHistory.create({
    data: {
      caseStudyId: input.caseStudyId,
      contentJson: {
        challenge: input.challengeJson,
        approach: input.approachJson,
      },
      contentHtml: `<h2>Challenge</h2>${input.challengeHtml}<h2>Approach</h2>${input.approachHtml}`,
      authorId: input.authorId,
    },
  });

  await trimVersionHistory({ caseStudyId: input.caseStudyId });
}

export function hasCaseStudyContentChanged(
  existing: {
    challengeHtml: string;
    approachHtml: string;
    challengeJson: Prisma.JsonValue;
    approachJson: Prisma.JsonValue;
  },
  input: {
    challengeHtml?: string;
    approachHtml?: string;
    challengeJson?: Prisma.InputJsonValue;
    approachJson?: Prisma.InputJsonValue;
  }
) {
  return (
    (input.challengeHtml !== undefined &&
      input.challengeHtml !== existing.challengeHtml) ||
    (input.approachHtml !== undefined &&
      input.approachHtml !== existing.approachHtml) ||
    (input.challengeJson !== undefined &&
      JSON.stringify(input.challengeJson) !==
        JSON.stringify(existing.challengeJson)) ||
    (input.approachJson !== undefined &&
      JSON.stringify(input.approachJson) !== JSON.stringify(existing.approachJson))
  );
}

export function hasBlogContentChanged(
  existing: { contentHtml: string; contentJson: Prisma.JsonValue },
  input: { contentHtml?: string; contentJson?: Prisma.InputJsonValue }
) {
  return (
    (input.contentHtml !== undefined &&
      input.contentHtml !== existing.contentHtml) ||
    (input.contentJson !== undefined &&
      JSON.stringify(input.contentJson) !== JSON.stringify(existing.contentJson))
  );
}
