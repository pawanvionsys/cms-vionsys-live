import {
  CaseStudy as PrismaCaseStudy,
  User,
  ResultStat,
  ProcessStep,
  MediaGalleryItem,
  SeoMeta,
  AeoGeoMeta,
  SchemaSettings,
  CaseStudyFaq
} from '@prisma/client';

type FullPrismaCaseStudy = PrismaCaseStudy & {
  author?: User;
  resultStats?: ResultStat[];
  processSteps?: ProcessStep[];
  mediaGallery?: MediaGalleryItem[];
  seoMeta?: SeoMeta | null;
  aeoGeoMeta?: AeoGeoMeta | null;
  schemaSettings?: SchemaSettings | null;
  faqs?: CaseStudyFaq[];
};

export class CaseStudyMapper {
  static toPublicJson(cs: FullPrismaCaseStudy) {
    if (cs.publishedAt == null) {
      return null;
    }

    const clientDisplayName = cs.clientName;

    return {
      id: cs.id,
      title: cs.title,
      slug: cs.slug,
      clientDisplayName,
      clientLogo: cs.clientLogo,
      industry: cs.industry,
      engagementType: cs.engagementType,
      publishedAt: cs.publishedAt,
      heroImage: cs.heroImage,
      heroImageAlt: cs.heroImageAlt,
      excerpt: cs.excerpt,
      isFeatured: cs.isFeatured,
      showMetricsOnTop: cs.showMetricsOnTop,
      serviceIds: cs.serviceIds,
      blogPostIds: cs.blogPostIds,
      
      // Core sections
      challengeHtml: cs.challengeHtml,
      approachHtml: cs.approachHtml,

      // Related Lists
      resultStats: cs.resultStats?.map(r => ({
        value: r.value,
        label: r.label,
        description: r.description
      })) || [],
      
      processSteps: cs.processSteps?.map(p => ({
        title: p.title,
        description: p.description,
        icon: p.icon,
        position: p.position
      })).sort((a, b) => a.position - b.position) || [],

      mediaGallery: cs.mediaGallery?.map(m => ({
        imagePath: m.imagePath,
        caption: m.caption,
        alt: m.alt,
        position: m.position
      })).sort((a, b) => a.position - b.position) || [],

      faqs: cs.faqs?.map(f => ({
        question: f.question,
        answer: f.answer,
        position: f.position
      })).sort((a, b) => a.position - b.position) || [],

      // Testimonial (only if quote exists)
      testimonial: cs.testimonialQuote
        ? {
            quote: cs.testimonialQuote,
            name: cs.testimonialName || 'Executive spokesperson',
            designation: cs.testimonialDesignation,
            company: clientDisplayName,
            avatarUrl: cs.testimonialImage || null
          }
        : null,

      // CTA
      cta: cs.ctaHeading
        ? {
            heading: cs.ctaHeading,
            body: cs.ctaBody,
            buttonLabel: cs.ctaButtonLabel,
            buttonUrl: cs.ctaButtonUrl
          }
        : null,

      seo: cs.seoMeta
        ? {
            title: cs.seoMeta.title,
            description: cs.seoMeta.description,
            focusKeyword: cs.seoMeta.focusKeyword,
            canonicalUrl: cs.seoMeta.canonicalUrl,
            ogTitle: cs.seoMeta.ogTitle || cs.seoMeta.title,
            ogDescription: cs.seoMeta.ogDescription || cs.seoMeta.description,
            ogImage: cs.seoMeta.ogImage || cs.heroImage,
            twitterCardType: cs.seoMeta.twitterCardType
          }
        : null,

      aeoGeo: cs.aeoGeoMeta
        ? {
            directAnswerPrompt: cs.aeoGeoMeta.directAnswerPrompt,
            snippetCandidate: cs.aeoGeoMeta.snippetCandidate,
            peopleAlsoAsk: cs.aeoGeoMeta.peopleAlsoAsk,
            semanticSummary: cs.aeoGeoMeta.semanticSummary,
            keyTakeaways: cs.aeoGeoMeta.keyTakeaways,
            statsSources: cs.aeoGeoMeta.statsSources,
            authorCredibility: cs.aeoGeoMeta.authorCredibility,
            reviewedBy: cs.aeoGeoMeta.reviewedBy
          }
        : null,

      schema: cs.schemaSettings
        ? {
            type: cs.schemaSettings.type,
            customSchemaJson: cs.schemaSettings.customSchemaJson
          }
        : null
    };
  }

  static toAdminJson(cs: FullPrismaCaseStudy) {
    return {
      id: cs.id,
      title: cs.title,
      slug: cs.slug,
      clientName: cs.clientName,
      clientLogo: cs.clientLogo,
      industry: cs.industry,
      engagementType: cs.engagementType,
      publishedAt: cs.publishedAt,
      heroImage: cs.heroImage,
      heroImageAlt: cs.heroImageAlt,
      excerpt: cs.excerpt,
      isFeatured: cs.isFeatured,
      showMetricsOnTop: cs.showMetricsOnTop,
      serviceIds: cs.serviceIds,
      blogPostIds: cs.blogPostIds,
      internalNote: cs.internalNote,
      challengeJson: cs.challengeJson,
      challengeHtml: cs.challengeHtml,
      approachJson: cs.approachJson,
      approachHtml: cs.approachHtml,

      // Testimonial
      testimonialQuote: cs.testimonialQuote,
      testimonialName: cs.testimonialName,
      testimonialDesignation: cs.testimonialDesignation,
      testimonialCompany: cs.testimonialCompany,
      testimonialImage: cs.testimonialImage,

      // CTA
      ctaHeading: cs.ctaHeading,
      ctaBody: cs.ctaBody,
      ctaButtonLabel: cs.ctaButtonLabel,
      ctaButtonUrl: cs.ctaButtonUrl,

      author: cs.author
        ? {
            id: cs.author.id,
            name: cs.author.name,
            role: cs.author.role
          }
        : null,

      resultStats: cs.resultStats || [],
      processSteps: cs.processSteps || [],
      mediaGallery: cs.mediaGallery || [],
      faqs: cs.faqs || [],
      seo: cs.seoMeta,
      aeoGeo: cs.aeoGeoMeta,
      schema: cs.schemaSettings,
      versions: (cs as any).versions || []
    };
  }
}
