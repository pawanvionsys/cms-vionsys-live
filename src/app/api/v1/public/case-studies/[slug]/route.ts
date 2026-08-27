import { NextRequest } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { CaseStudyMapper } from '../../../../../../features/case-studies/case-study.mapper';
import { ApiResponse } from '../../../../../../lib/api-response';
import { validatePublicApiKey } from '../../../../../../features/auth/validate-public-api-key';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const isValid = await validatePublicApiKey(request);
    if (!isValid) {
      return ApiResponse.unauthorized('Missing or invalid API Key in header "x-vionsys-cms-key".');
    }

    const { slug } = await params;

    const cs = await prisma.caseStudy.findUnique({
      where: { slug },
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

    if (!cs || cs.publishedAt == null) {
      return ApiResponse.notFound('Published case study not found.');
    }

    const publicCs = CaseStudyMapper.toPublicJson(cs);
    return ApiResponse.success(publicCs);
  } catch (err: any) {
    console.error('Public case study detail API error:', err);
    return ApiResponse.serverError('An error occurred loading the case study.', err.message);
  }
}
export const dynamic = 'force-dynamic';
