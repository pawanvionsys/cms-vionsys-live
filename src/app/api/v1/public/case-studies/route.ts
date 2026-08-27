import { NextRequest } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { CaseStudyMapper } from '../../../../../features/case-studies/case-study.mapper';
import { ApiResponse } from '../../../../../lib/api-response';
import { validatePublicApiKey } from '../../../../../features/auth/validate-public-api-key';

export async function GET(request: NextRequest) {
  try {
    const isValid = await validatePublicApiKey(request);
    if (!isValid) {
      return ApiResponse.unauthorized('Missing or invalid API Key in header "x-vionsys-cms-key".');
    }

    const caseStudies = await prisma.caseStudy.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: 'desc' },
      include: {
        author: true,
        resultStats: true,
        processSteps: true,
        mediaGallery: true,
        seoMeta: true,
        aeoGeoMeta: true,
        schemaSettings: true,
        faqs: true
      }
    });

    const publicCs = caseStudies
      .map(CaseStudyMapper.toPublicJson)
      .filter(Boolean); // Filter out unpublished ones

    return ApiResponse.success(publicCs);
  } catch (err: any) {
    console.error('Public case studies list API error:', err);
    return ApiResponse.serverError('An error occurred loading case studies data.', err.message);
  }
}
export const dynamic = 'force-dynamic';
