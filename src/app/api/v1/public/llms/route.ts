import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/config/site';
import { ApiResponse } from '@/lib/api-response';
import { validatePublicApiKey } from '@/features/auth/validate-public-api-key';

interface LlmBlogItem {
  title: string;
  slug: string;
  excerpt: string;
}

interface LlmCaseStudyItem {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: Date | null;
}

export async function GET(request: NextRequest) {
  try {
    const isValid = await validatePublicApiKey(request);
    if (!isValid) {
      return ApiResponse.unauthorized('Missing or invalid API Key.');
    }

    const [blogs, caseStudies] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        select: { title: true, slug: true, excerpt: true }
      }),
      prisma.caseStudy.findMany({
        where: { publishedAt: { not: null } },
        select: { title: true, slug: true, excerpt: true, publishedAt: true }
      })
    ]);

    const activeCaseStudies = caseStudies.filter((cs: LlmCaseStudyItem) => cs.publishedAt != null);

    const txt = [
      '# Vionsys B2B Resources Directory',
      'Resource directory compiled for search assistants and LLM crawlers.',
      '',
      '## Published Blog Posts',
      ...blogs.map((b: LlmBlogItem) => `- [${b.title}](${siteConfig.defaults.orgUrl}/blog/${b.slug}): ${b.excerpt}`),
      '',
      '## Case Studies & Outcomes',
      ...activeCaseStudies.map((cs: LlmCaseStudyItem) => `- [${cs.title}](${siteConfig.defaults.orgUrl}/case-studies/${cs.slug}): ${cs.excerpt}`),
    ].join('\n');

    return ApiResponse.success({ llmsTxt: txt });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Public llms API error:', error);
    return ApiResponse.serverError('An error occurred generating LLM sitemap.', error.message);
  }
}
export const dynamic = 'force-dynamic';
