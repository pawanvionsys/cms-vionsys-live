import { prisma, runTransactionWithRetry } from '../../lib/prisma';
import { CaseStudyFormInput } from './case-study.validation';
import { slugify } from '../../lib/slugify';
import { AppError } from '../../lib/errors';
import { CaseStudyMapper } from './case-study.mapper';
import { Prisma, VersionHistory } from '@prisma/client';

export class CaseStudyService {
  static async listCaseStudies(params: {
    industry?: string;
    approvalStatus?: string;
    engagementType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { industry, approvalStatus, engagementType, search, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (industry) where.industry = industry;
    if (engagementType) where.engagementType = engagementType;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { clientName: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, items] = await Promise.all([
      prisma.caseStudy.count({ where }),
      prisma.caseStudy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
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
      })
    ]);

    return {
      total,
      page,
      limit,
      items: items.map(CaseStudyMapper.toAdminJson)
    };
  }

  static async getCaseStudyById(id: string) {
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
        faqs: true
      }
    });

    if (!cs) throw new AppError('Case study not found', 'NOT_FOUND', 404);
    return CaseStudyMapper.toAdminJson(cs);
  }

  static async createCaseStudy(
    authorId: string,
    input: CaseStudyFormInput & { challengeJson: any; challengeHtml: string; approachJson: any; approachHtml: string }
  ) {
    const finalSlug = input.slug ? slugify(input.slug) : slugify(input.title);

    // Verify slug uniqueness
    const existing = await prisma.caseStudy.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      throw new AppError(`Slug "${finalSlug}" is already in use`, 'DUPLICATE_SLUG', 400);
    }

    const metaTitle = input.title.substring(0, 60);
    const metaDesc = input.excerpt ? input.excerpt.substring(0, 160) : input.title.substring(0, 160);

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const cs = await tx.caseStudy.create({
        data: {
          title: input.title,
          slug: finalSlug,
          clientName: input.clientName,
          clientLogo: input.clientLogo || null,
          industry: input.industry,
          engagementType: input.engagementType,
          heroImage: input.heroImage || null,
          heroImageAlt: input.heroImageAlt || null,
          excerpt: input.excerpt || '',
          isFeatured: input.isFeatured,
          serviceIds: input.serviceIds,
          blogPostIds: input.blogPostIds,
          internalNote: input.internalNote || null,
          challengeHtml: input.challengeHtml,
          challengeJson: input.challengeJson,
          approachHtml: input.approachHtml,
          approachJson: input.approachJson,
          authorId,

          // Testimonial
          testimonialQuote: input.testimonialQuote || null,
          testimonialName: input.testimonialName || null,
          testimonialDesignation: input.testimonialDesignation || null,
          testimonialCompany: input.testimonialCompany || null,
          testimonialImage: input.testimonialImage || null,

          // CTA
          ctaHeading: input.ctaHeading || null,
          ctaBody: input.ctaBody || null,
          ctaButtonLabel: input.ctaButtonLabel || null,
          ctaButtonUrl: input.ctaButtonUrl || null,

          seoMeta: {
            create: {
              title: metaTitle,
              description: metaDesc,
              focusKeyword: input.clientName || 'vionsys',
              secondaryKeywords: [],
              index: true,
              follow: true,
              twitterCardType: 'summary_large_image'
            }
          },
          aeoGeoMeta: {
            create: {
              directAnswerPrompt: '',
              snippetCandidate: '',
              keyTakeaways: [],
              allowAiCrawler: true
            }
          },
          schemaSettings: {
            create: {
              type: 'CaseStudy/WebPage'
            }
          }
        },
        include: {
          author: true,
          seoMeta: true,
          aeoGeoMeta: true,
          schemaSettings: true
        }
      });

      // Add Result Stats
      if (input.resultStats && input.resultStats.length > 0) {
        await tx.resultStat.createMany({
          data: input.resultStats.map(stat => ({
            caseStudyId: cs.id,
            value: stat.value,
            label: stat.label,
            description: stat.description || ''
          }))
        });
      }

      // Add Process Steps
      if (input.processSteps && input.processSteps.length > 0) {
        await tx.processStep.createMany({
          data: input.processSteps.map((step, idx) => ({
            caseStudyId: cs.id,
            title: step.title,
            description: step.description,
            icon: step.icon || null,
            position: idx
          }))
        });
      }

      // Add Media Gallery
      if (input.mediaGallery && input.mediaGallery.length > 0) {
        await tx.mediaGalleryItem.createMany({
          data: input.mediaGallery.map((item, idx) => ({
            caseStudyId: cs.id,
            imagePath: item.imagePath,
            caption: item.caption || null,
            alt: item.alt || null,
            position: idx
          }))
        });
      }

      // Add FAQs
      if (input.faqs && input.faqs.length > 0) {
        await tx.caseStudyFaq.createMany({
          data: input.faqs.map((faq, idx) => ({
            caseStudyId: cs.id,
            question: faq.question,
            answer: faq.answer,
            position: idx
          }))
        });
      }

      await tx.activityLog.create({
        data: {
          userId: authorId,
          action: 'CASE_STUDY_CREATE',
          details: `Created case study: "${cs.title}" (${cs.id})`
        }
      });

      // Refetch with all relations
      const finalCs = await tx.caseStudy.findUnique({
        where: { id: cs.id },
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

      return CaseStudyMapper.toAdminJson(finalCs!);
    });
  }

  static async updateCaseStudy(
    id: string,
    authorId: string,
    input: Partial<CaseStudyFormInput> & {
      challengeJson?: any;
      challengeHtml?: string;
      approachJson?: any;
      approachHtml?: string;
      seo?: any;
      aeoGeo?: any;
      schema?: any;
      status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    }
  ) {
    const existing = await prisma.caseStudy.findUnique({
      where: { id },
      include: { seoMeta: true }
    });

    if (!existing) {
      throw new AppError('Case study not found', 'NOT_FOUND', 404);
    }

    const updates: any = {};
    const fields = [
      'title',
      'clientName',
      'clientLogo',
      'industry',
      'engagementType',
      'heroImage',
      'heroImageAlt',
      'excerpt',
      'isFeatured',
      'serviceIds',
      'blogPostIds',
      'internalNote',
      'testimonialQuote',
      'testimonialName',
      'testimonialDesignation',
      'testimonialCompany',
      'testimonialImage',
      'ctaHeading',
      'ctaBody',
      'ctaButtonLabel',
      'ctaButtonUrl'
    ];

    for (const field of fields) {
      if ((input as any)[field] !== undefined) {
        updates[field] = (input as any)[field];
      }
    }

    if (input.challengeHtml !== undefined) updates.challengeHtml = input.challengeHtml;
    if (input.challengeJson !== undefined) updates.challengeJson = input.challengeJson;
    if (input.approachHtml !== undefined) updates.approachHtml = input.approachHtml;
    if (input.approachJson !== undefined) updates.approachJson = input.approachJson;

    // Handle slug change & Redirects
    if (input.slug !== undefined && input.slug !== existing.slug) {
      const finalSlug = slugify(input.slug);
      
      const isSlugTaken = await prisma.caseStudy.findFirst({
        where: { slug: finalSlug, id: { not: id } }
      });
      if (isSlugTaken) {
        throw new AppError(`Slug "${finalSlug}" is already taken`, 'DUPLICATE_SLUG', 400);
      }
      
      updates.slug = finalSlug;

      if (existing.publishedAt) {
        const fromPath = `/case-studies/${existing.slug}`;
        const toPath = `/case-studies/${finalSlug}`;
        
        await prisma.redirect.upsert({
          where: { fromPath },
          update: { toPath, statusCode: 301 },
          create: { fromPath, toPath, statusCode: 301 }
        });
      }
    }

    // Handle published date
    if (input.status === 'PUBLISHED' && !existing.publishedAt) {
      updates.publishedAt = new Date();
    }

    return runTransactionWithRetry(async (tx: Prisma.TransactionClient) => {
      // 1. Update main record
      const updated = await tx.caseStudy.update({
        where: { id },
        data: updates,
        include: {
          author: true,
          seoMeta: true,
          aeoGeoMeta: true,
          schemaSettings: true
        }
      });

      // 2. Result Stats (Replace)
      if (input.resultStats !== undefined) {
        await tx.resultStat.deleteMany({ where: { caseStudyId: id } });
        if (input.resultStats.length > 0) {
          await tx.resultStat.createMany({
            data: input.resultStats.map(stat => ({
              caseStudyId: id,
              value: stat.value,
              label: stat.label,
              description: stat.description || ''
            }))
          });
        }
      }

      // 3. Process Steps (Replace)
      if (input.processSteps !== undefined) {
        await tx.processStep.deleteMany({ where: { caseStudyId: id } });
        if (input.processSteps.length > 0) {
          await tx.processStep.createMany({
            data: input.processSteps.map((step, idx) => ({
              caseStudyId: id,
              title: step.title,
              description: step.description,
              icon: step.icon || null,
              position: idx
            }))
          });
        }
      }

      // 4. Media Gallery (Replace)
      if (input.mediaGallery !== undefined) {
        await tx.mediaGalleryItem.deleteMany({ where: { caseStudyId: id } });
        if (input.mediaGallery.length > 0) {
          await tx.mediaGalleryItem.createMany({
            data: input.mediaGallery.map((item, idx) => ({
              caseStudyId: id,
              imagePath: item.imagePath,
              caption: item.caption || null,
              alt: item.alt || null,
              position: idx
            }))
          });
        }
      }

      // 5. FAQs (Replace)
      if (input.faqs !== undefined) {
        await tx.caseStudyFaq.deleteMany({ where: { caseStudyId: id } });
        if (input.faqs.length > 0) {
          await tx.caseStudyFaq.createMany({
            data: input.faqs.map((faq, idx) => ({
              caseStudyId: id,
              question: faq.question,
              answer: faq.answer,
              position: idx
            }))
          });
        }
      }

      // 5. Update SEO
      if (input.seo) {
        await tx.seoMeta.update({
          where: { caseStudyId: id },
          data: {
            title: input.seo.title || updated.title,
            description: input.seo.description || updated.excerpt,
            focusKeyword: input.seo.focusKeyword || '',
            secondaryKeywords: input.seo.secondaryKeywords || [],
            canonicalUrl: input.seo.canonicalUrl || null,
            index: input.seo.index !== undefined ? input.seo.index : true,
            follow: input.seo.follow !== undefined ? input.seo.follow : true,
            ogTitle: input.seo.ogTitle || null,
            ogDescription: input.seo.ogDescription || null,
            ogImage: input.seo.ogImage || null,
            twitterCardType: input.seo.twitterCardType || 'summary_large_image'
          }
        });
      }

      // 6. Update AEO/GEO
      if (input.aeoGeo) {
        await tx.aeoGeoMeta.update({
          where: { caseStudyId: id },
          data: {
            directAnswerPrompt: input.aeoGeo.directAnswerPrompt || null,
            snippetCandidate: input.aeoGeo.snippetCandidate || null,
            peopleAlsoAsk: input.aeoGeo.peopleAlsoAsk || null,
            semanticSummary: input.aeoGeo.semanticSummary || null,
            keyTakeaways: input.aeoGeo.keyTakeaways || [],
            statsSources: input.aeoGeo.statsSources || null,
            authorCredibility: input.aeoGeo.authorCredibility || null,
            reviewedBy: input.aeoGeo.reviewedBy || null,
            allowAiCrawler: input.aeoGeo.allowAiCrawler !== undefined ? input.aeoGeo.allowAiCrawler : true
          }
        });
      }

      // 7. Update Schema Settings
      if (input.schema) {
        await tx.schemaSettings.update({
          where: { caseStudyId: id },
          data: {
            type: input.schema.type || 'CaseStudy/WebPage',
            customSchemaJson: input.schema.customSchemaJson || null
          }
        });
      }

      // 8. Capture Version History
      await tx.versionHistory.create({
        data: {
          caseStudyId: id,
          contentJson: { challenge: updated.challengeJson, approach: updated.approachJson },
          contentHtml: `<h2>Challenge</h2>${updated.challengeHtml}<h2>Approach</h2>${updated.approachHtml}`,
          authorId
        }
      });

      // Maintain max 20 versions
      const versions = await tx.versionHistory.findMany({
        where: { caseStudyId: id },
        orderBy: { createdAt: 'desc' }
      });
      if (versions.length > 20) {
        const toDeleteIds = versions.slice(20).map((v: VersionHistory) => v.id);
        await tx.versionHistory.deleteMany({ where: { id: { in: toDeleteIds } } });
      }

      await tx.activityLog.create({
        data: {
          userId: authorId,
          action: 'CASE_STUDY_UPDATE',
          details: `Updated case study: "${updated.title}" (${id})`
        }
      });

      const finalCs = await tx.caseStudy.findUnique({
        where: { id },
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

      return CaseStudyMapper.toAdminJson(finalCs!);
    });
  }

  static async deleteCaseStudy(id: string, userId: string) {
    const cs = await prisma.caseStudy.findUnique({ where: { id } });
    if (!cs) throw new AppError('Case study not found', 'NOT_FOUND', 404);

    await prisma.$transaction([
      prisma.caseStudy.delete({ where: { id } }),
      prisma.activityLog.create({
        data: {
          userId,
          action: 'CASE_STUDY_DELETE',
          details: `Deleted case study: "${cs.title}" (${id})`
        }
      })
    ]);

    return { success: true };
  }
}
