import { prisma, runTransactionWithRetry } from '../../lib/prisma';
import { BlogFormInput } from './blog.validation';
import { slugify } from '../../lib/slugify';
import { calculateReadingTime } from '../../lib/reading-time';
import { calculateReadability } from '../../lib/readability';
import { calculateKeywordDensity } from '../../lib/keyword-density';
import { parseHeadingOutline } from '../../lib/heading-outline';
import { hasPermission } from '../../config/permissions';
import { AppError } from '../../lib/errors';
import { BlogMapper } from './blog.mapper';

export class BlogService {
  static async listBlogs(params: {
    status?: string;
    categoryId?: string;
    authorId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, categoryId, authorId, search, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          author: true,
          category: true,
          tags: true,
          seoMeta: true,
          aeoGeoMeta: true,
          schemaSettings: true,
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      items: items.map(BlogMapper.toAdminJson),
    };
  }

  static async getBlogById(id: string) {
    const blog = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        tags: true,
        seoMeta: true,
        aeoGeoMeta: true,
        schemaSettings: true,
      },
    });

    if (!blog) throw new AppError('Blog post not found', 'NOT_FOUND', 404);
    return BlogMapper.toAdminJson(blog);
  }

  static async getBlogBySlug(slug: string) {
    const blog = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: true,
        category: true,
        tags: true,
        seoMeta: true,
        aeoGeoMeta: true,
        schemaSettings: true,
      },
    });

    if (!blog) return null;
    return blog;
  }

  static async createBlog(authorId: string, input: BlogFormInput & { contentJson: any; contentHtml: string }) {
    const textContent = input.contentHtml.replace(/<\/?[^>]+(>|$)/g, ' ');
    const finalSlug = input.slug ? slugify(input.slug) : slugify(input.title);

    // Verify slug uniqueness
    const existing = await prisma.blogPost.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      throw new AppError(`Slug "${finalSlug}" is already in use`, 'DUPLICATE_SLUG', 400);
    }

    // Default SEO tags if empty
    const metaTitle = input.title.substring(0, 60);
    const metaDesc = input.excerpt ? input.excerpt.substring(0, 160) : input.title.substring(0, 160);

    return runTransactionWithRetry(async (tx) => {
      const blog = await tx.blogPost.create({
        data: {
          title: input.title,
          slug: finalSlug,
          contentJson: input.contentJson,
          contentHtml: input.contentHtml,
          contentText: textContent,
          excerpt: input.excerpt || '',
          featuredImage: input.featuredImage || null,
          featuredImageAlt: input.featuredImageAlt || null,
          isFeatured: input.isFeatured,
          status: input.status,
          guestAuthor: input.guestAuthor || null,
          internalNote: input.internalNote || null,
          serviceIds: input.serviceIds,
          caseStudyIds: input.caseStudyIds,
          contentBriefUrl: input.contentBriefUrl || null,
          authorId,
          categoryId: input.categoryId || null,
          publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
          seoMeta: {
            create: {
              title: metaTitle,
              description: metaDesc,
              focusKeyword: input.title.split(' ')[0] || 'vionsys',
              secondaryKeywords: [],
              index: true,
              follow: true,
              twitterCardType: 'summary_large_image',
            },
          },
          aeoGeoMeta: {
            create: {
              directAnswerPrompt: '',
              snippetCandidate: '',
              keyTakeaways: [],
              allowAiCrawler: true,
            },
          },
          schemaSettings: {
            create: {
              type: 'BlogPosting',
            },
          },
        },
        include: {
          author: true,
          category: true,
          tags: true,
          seoMeta: true,
          aeoGeoMeta: true,
          schemaSettings: true,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: authorId,
          action: 'BLOG_CREATE',
          details: `Created blog post: "${blog.title}" (${blog.id})`,
        },
      });

      return BlogMapper.toAdminJson(blog);
    });
  }

  static async updateBlog(
    id: string,
    authorId: string,
    input: Partial<BlogFormInput> & {
      contentJson?: any;
      contentHtml?: string;
      seo?: any;
      aeoGeo?: any;
      schema?: any;
    }
  ) {
    const existing = await prisma.blogPost.findUnique({
      where: { id },
      include: { seoMeta: true },
    });

    if (!existing) {
      throw new AppError('Blog post not found', 'NOT_FOUND', 404);
    }

    const updates: any = {};
    if (input.title !== undefined) updates.title = input.title;
    if (input.excerpt !== undefined) updates.excerpt = input.excerpt;
    if (input.featuredImage !== undefined) updates.featuredImage = input.featuredImage;
    if (input.featuredImageAlt !== undefined) updates.featuredImageAlt = input.featuredImageAlt;
    if (input.isFeatured !== undefined) updates.isFeatured = input.isFeatured;
    if (input.status !== undefined) updates.status = input.status;
    if (input.guestAuthor !== undefined) updates.guestAuthor = input.guestAuthor;
    if (input.internalNote !== undefined) updates.internalNote = input.internalNote;
    if (input.serviceIds !== undefined) updates.serviceIds = input.serviceIds;
    if (input.caseStudyIds !== undefined) updates.caseStudyIds = input.caseStudyIds;
    if (input.contentBriefUrl !== undefined) updates.contentBriefUrl = input.contentBriefUrl;
    if (input.categoryId !== undefined) updates.categoryId = input.categoryId;

    if (input.contentHtml !== undefined) {
      updates.contentHtml = input.contentHtml;
      updates.contentText = input.contentHtml.replace(/<\/?[^>]+(>|$)/g, ' ');
    }
    if (input.contentJson !== undefined) {
      updates.contentJson = input.contentJson;
    }

    // Handle slug change & Redirects
    if (input.slug !== undefined && input.slug !== existing.slug) {
      const finalSlug = slugify(input.slug);
      
      // Verify slug uniqueness
      const isSlugTaken = await prisma.blogPost.findFirst({
        where: { slug: finalSlug, id: { not: id } },
      });
      if (isSlugTaken) {
        throw new AppError(`Slug "${finalSlug}" is already taken`, 'DUPLICATE_SLUG', 400);
      }
      
      updates.slug = finalSlug;

      // If it was already published (or is now being updated as published), generate redirect
      if (existing.status === 'PUBLISHED') {
        const fromPath = `/blog/${existing.slug}`;
        const toPath = `/blog/${finalSlug}`;
        
        await prisma.redirect.upsert({
          where: { fromPath },
          update: { toPath, statusCode: 301 },
          create: { fromPath, toPath, statusCode: 301 },
        });
      }
    }

    // Set published date if status changing to PUBLISHED
    if (input.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      updates.publishedAt = new Date();
    }

    return runTransactionWithRetry(async (tx) => {
      const updated = await tx.blogPost.update({
        where: { id },
        data: updates,
        include: {
          author: true,
          category: true,
          tags: true,
          seoMeta: true,
          aeoGeoMeta: true,
          schemaSettings: true,
        },
      });

      // Update SEO
      if (input.seo) {
        await tx.seoMeta.update({
          where: { blogPostId: id },
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
            twitterCardType: input.seo.twitterCardType || 'summary_large_image',
          },
        });
      }

      // Update AEO/GEO
      if (input.aeoGeo) {
        await tx.aeoGeoMeta.update({
          where: { blogPostId: id },
          data: {
            directAnswerPrompt: input.aeoGeo.directAnswerPrompt || null,
            snippetCandidate: input.aeoGeo.snippetCandidate || null,
            peopleAlsoAsk: input.aeoGeo.peopleAlsoAsk || null,
            semanticSummary: input.aeoGeo.semanticSummary || null,
            keyTakeaways: input.aeoGeo.keyTakeaways || [],
            statsSources: input.aeoGeo.statsSources || null,
            authorCredibility: input.aeoGeo.authorCredibility || null,
            reviewedBy: input.aeoGeo.reviewedBy || null,
            allowAiCrawler: input.aeoGeo.allowAiCrawler !== undefined ? input.aeoGeo.allowAiCrawler : true,
          },
        });
      }

      // Update Schema Settings
      if (input.schema) {
        await tx.schemaSettings.update({
          where: { blogPostId: id },
          data: {
            type: input.schema.type || 'BlogPosting',
            customSchemaJson: input.schema.customSchemaJson || null,
          },
        });
      }

      // Record Version History
      await tx.versionHistory.create({
        data: {
          blogPostId: id,
          contentJson: updated.contentJson || {},
          contentHtml: updated.contentHtml,
          authorId,
        },
      });

      // Keep only last 20 versions
      const versions = await tx.versionHistory.findMany({
        where: { blogPostId: id },
        orderBy: { createdAt: 'desc' },
      });
      if (versions.length > 20) {
        const toDeleteIds = versions.slice(20).map(v => v.id);
        await tx.versionHistory.deleteMany({
          where: { id: { in: toDeleteIds } },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: authorId,
          action: 'BLOG_UPDATE',
          details: `Updated blog post: "${updated.title}" (${id})`,
        },
      });

      // Refetch with updated sub-models
      const finalResult = await tx.blogPost.findUnique({
        where: { id },
        include: {
          author: true,
          category: true,
          tags: true,
          seoMeta: true,
          aeoGeoMeta: true,
          schemaSettings: true,
        },
      });

      return BlogMapper.toAdminJson(finalResult!);
    });
  }

  static async deleteBlog(id: string, userId: string) {
    const blog = await prisma.blogPost.findUnique({ where: { id } });
    if (!blog) throw new AppError('Blog post not found', 'NOT_FOUND', 404);

    await prisma.$transaction([
      prisma.blogPost.delete({ where: { id } }),
      prisma.activityLog.create({
        data: {
          userId,
          action: 'BLOG_DELETE',
          details: `Deleted blog post: "${blog.title}" (${id})`,
        },
      }),
    ]);

    return { success: true };
  }
}
