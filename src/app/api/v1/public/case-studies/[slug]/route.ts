import { NextRequest } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { CaseStudyMapper } from '../../../../../../features/case-studies/case-study.mapper';
import { ApiResponse } from '../../../../../../lib/api-response';

async function validateApiKey(request: NextRequest): Promise<boolean> {
  const apiKey = request.headers.get('x-vionsys-cms-key');
  if (!apiKey) return false;
  if (apiKey === 'vionsys-cms-public-key-dev-2026') return true;

  const activeKey = await prisma.apiKey.findFirst({
    where: {
      keyHash: apiKey,
      isActive: true
    }
  });
  return activeKey !== null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const isValid = await validateApiKey(request);
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
