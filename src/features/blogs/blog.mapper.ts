import { BlogPost as PrismaBlogPost, User, Category, Tag, SeoMeta, AeoGeoMeta, SchemaSettings } from '@prisma/client';

type FullPrismaBlogPost = PrismaBlogPost & {
  author?: User;
  category?: Category | null;
  tags?: Tag[];
  seoMeta?: SeoMeta | null;
  aeoGeoMeta?: AeoGeoMeta | null;
  schemaSettings?: SchemaSettings | null;
};

export class BlogMapper {
  static toPublicJson(blog: FullPrismaBlogPost) {
    if (blog.status !== 'PUBLISHED') {
      return null;
    }

    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      contentHtml: blog.contentHtml,
      excerpt: blog.excerpt,
      featuredImage: blog.featuredImage,
      featuredImageAlt: blog.featuredImageAlt,
      isFeatured: blog.isFeatured,
      publishedAt: blog.publishedAt,
      guestAuthor: blog.guestAuthor,
      serviceIds: blog.serviceIds,
      caseStudyIds: blog.caseStudyIds,
      category: blog.category
        ? {
            name: blog.category.name,
            slug: blog.category.slug,
          }
        : null,
      tags: blog.tags?.map(t => ({ name: t.name, slug: t.slug })) || [],
      seo: blog.seoMeta
        ? {
            title: blog.seoMeta.title,
            description: blog.seoMeta.description,
            focusKeyword: blog.seoMeta.focusKeyword,
            canonicalUrl: blog.seoMeta.canonicalUrl,
            ogTitle: blog.seoMeta.ogTitle || blog.seoMeta.title,
            ogDescription: blog.seoMeta.ogDescription || blog.seoMeta.description,
            ogImage: blog.seoMeta.ogImage || blog.featuredImage,
            twitterCardType: blog.seoMeta.twitterCardType,
          }
        : null,
      aeoGeo: blog.aeoGeoMeta
        ? {
            directAnswerPrompt: blog.aeoGeoMeta.directAnswerPrompt,
            snippetCandidate: blog.aeoGeoMeta.snippetCandidate,
            peopleAlsoAsk: blog.aeoGeoMeta.peopleAlsoAsk,
            semanticSummary: blog.aeoGeoMeta.semanticSummary,
            keyTakeaways: blog.aeoGeoMeta.keyTakeaways,
            statsSources: blog.aeoGeoMeta.statsSources,
            authorCredibility: blog.aeoGeoMeta.authorCredibility,
            reviewedBy: blog.aeoGeoMeta.reviewedBy,
          }
        : null,
      schema: blog.schemaSettings
        ? {
            type: blog.schemaSettings.type,
            customSchemaJson: blog.schemaSettings.customSchemaJson,
          }
        : null,
    };
  }

  static toAdminJson(blog: FullPrismaBlogPost) {
    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      contentJson: blog.contentJson,
      contentHtml: blog.contentHtml,
      contentText: blog.contentText,
      excerpt: blog.excerpt,
      featuredImage: blog.featuredImage,
      featuredImageAlt: blog.featuredImageAlt,
      isFeatured: blog.isFeatured,
      status: blog.status,
      publishedAt: blog.publishedAt,
      scheduledAt: blog.scheduledAt,
      guestAuthor: blog.guestAuthor,
      internalNote: blog.internalNote,
      serviceIds: blog.serviceIds,
      caseStudyIds: blog.caseStudyIds,
      contentBriefUrl: blog.contentBriefUrl,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      author: blog.author
        ? {
            id: blog.author.id,
            name: blog.author.name,
            role: blog.author.role,
          }
        : null,
      category: blog.category,
      tags: blog.tags || [],
      seo: blog.seoMeta,
      aeoGeo: blog.aeoGeoMeta,
      schema: blog.schemaSettings,
    };
  }
}
