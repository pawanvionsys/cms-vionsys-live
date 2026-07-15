import { prisma } from '../../lib/prisma';
import { RevalidationService } from './revalidation.service';
import { AppError } from '../../lib/errors';

export interface ValidationIssue {
  type: 'blocker' | 'warning';
  message: string;
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

export class PublishService {
  /**
   * Validate a blog post before publishing.
   */
  static async validateBlogPost(id: string): Promise<ValidationResult> {
    const blog = await prisma.blogPost.findUnique({
      where: { id },
      include: { seoMeta: true, schemaSettings: true, author: true }
    });

    if (!blog) throw new AppError('Blog post not found', 'NOT_FOUND', 404);

    const issues: ValidationIssue[] = [];

    // Critical blockers
    if (!blog.title || blog.title.trim() === '') {
      issues.push({ type: 'blocker', message: 'Missing document title.', field: 'title' });
    }
    if (!blog.slug || blog.slug.trim() === '') {
      issues.push({ type: 'blocker', message: 'Missing URL slug.', field: 'slug' });
    }
    if (!blog.authorId) {
      issues.push({ type: 'blocker', message: 'Missing document author.', field: 'authorId' });
    }
    
    if (!blog.seoMeta) {
      issues.push({ type: 'blocker', message: 'Missing SEO Meta data.' });
    } else {
      if (!blog.seoMeta.title || blog.seoMeta.title.trim() === '') {
        issues.push({ type: 'blocker', message: 'Missing meta title.', field: 'seo.title' });
      }
      if (!blog.seoMeta.description || blog.seoMeta.description.trim() === '') {
        issues.push({ type: 'blocker', message: 'Missing meta description.', field: 'seo.description' });
      }
    }

    if (blog.featuredImage && (!blog.featuredImageAlt || blog.featuredImageAlt.trim() === '')) {
      issues.push({ type: 'blocker', message: 'Alt text is required for the featured image.', field: 'featuredImageAlt' });
    }

    if (!blog.schemaSettings || !blog.schemaSettings.type) {
      issues.push({ type: 'blocker', message: 'Missing schema type selection.', field: 'schema.type' });
    }

    // Warnings
    if (blog.seoMeta) {
      const titleLen = blog.seoMeta.title.length;
      if (titleLen < 30 || titleLen > 60) {
        issues.push({
          type: 'warning',
          message: `Meta title is ${titleLen} characters. Recommended length is between 30 and 60 characters.`,
          field: 'seo.title'
        });
      }

      const descLen = blog.seoMeta.description.length;
      if (descLen < 120 || descLen > 160) {
        issues.push({
          type: 'warning',
          message: `Meta description is ${descLen} characters. Recommended length is between 120 and 160 characters.`,
          field: 'seo.description'
        });
      }
    }

    if (blog.serviceIds.length === 0) {
      issues.push({ type: 'warning', message: 'No related services selected.', field: 'serviceIds' });
    }

    // Check content length or elements (Tiptap HTML checks)
    const hasFaq = blog.contentHtml.includes('faq-block') || blog.contentHtml.includes('FAQ');
    if (!hasFaq) {
      issues.push({ type: 'warning', message: 'No FAQ section detected in content.' });
    }

    const hasTakeaways = blog.contentHtml.includes('key-takeaways') || blog.contentHtml.includes('Takeaways');
    if (!hasTakeaways) {
      issues.push({ type: 'warning', message: 'No Key Takeaways block detected in content.' });
    }

    const hasCta = blog.contentHtml.includes('cta-block') || blog.contentHtml.includes('CTA');
    if (!hasCta) {
      issues.push({ type: 'warning', message: 'No CTA blocks detected in content.' });
    }

    return {
      isValid: !issues.some(i => i.type === 'blocker'),
      issues
    };
  }

  /**
   * Validate a case study before publishing.
   */
  static async validateCaseStudy(id: string): Promise<ValidationResult> {
    const cs = await prisma.caseStudy.findUnique({
      where: { id },
      include: { seoMeta: true, schemaSettings: true, resultStats: true, processSteps: true, faqs: true }
    });

    if (!cs) throw new AppError('Case study not found', 'NOT_FOUND', 404);

    const issues: ValidationIssue[] = [];

    // Critical blockers
    if (!cs.title || cs.title.trim() === '') {
      issues.push({ type: 'blocker', message: 'Missing document title.', field: 'title' });
    }
    if (!cs.slug || cs.slug.trim() === '') {
      issues.push({ type: 'blocker', message: 'Missing URL slug.', field: 'slug' });
    }
    if (!cs.resultStats || cs.resultStats.length < 2) {
      issues.push({ type: 'blocker', message: 'A case study requires at least 2 results metrics.', field: 'resultStats' });
    }

    if (!cs.seoMeta) {
      issues.push({ type: 'blocker', message: 'Missing SEO Meta data.' });
    } else {
      if (!cs.seoMeta.title || cs.seoMeta.title.trim() === '') {
        issues.push({ type: 'blocker', message: 'Missing meta title.', field: 'seo.title' });
      }
      if (!cs.seoMeta.description || cs.seoMeta.description.trim() === '') {
        issues.push({ type: 'blocker', message: 'Missing meta description.', field: 'seo.description' });
      }
    }

    if (cs.heroImage && (!cs.heroImageAlt || cs.heroImageAlt.trim() === '')) {
      issues.push({ type: 'blocker', message: 'Alt text is required for the hero image.', field: 'heroImageAlt' });
    }

    if (!cs.schemaSettings || !cs.schemaSettings.type) {
      issues.push({ type: 'blocker', message: 'Missing schema type selection.', field: 'schema.type' });
    }

    // Warnings
    if (cs.seoMeta) {
      const titleLen = cs.seoMeta.title.length;
      if (titleLen < 30 || titleLen > 60) {
        issues.push({
          type: 'warning',
          message: `Meta title is ${titleLen} characters. Recommended length is 30-60.`,
          field: 'seo.title'
        });
      }
    }

    if (cs.serviceIds.length === 0) {
      issues.push({ type: 'warning', message: 'No services associated.', field: 'serviceIds' });
    }

    if (!cs.ctaHeading) {
      issues.push({ type: 'warning', message: 'No CTA block configured for this case study.', field: 'ctaHeading' });
    }

    return {
      isValid: !issues.some(i => i.type === 'blocker'),
      issues
    };
  }

  /**
   * Transition blog post status to PUBLISHED.
   */
  static async publishBlog(id: string): Promise<void> {
    const { isValid, issues } = await this.validateBlogPost(id);
    if (!isValid) {
      const blockers = issues.filter(i => i.type === 'blocker').map(i => i.message);
      throw new AppError(`Cannot publish due to blockers: ${blockers.join(', ')}`, 'PUBLISH_BLOCKED', 400, issues);
    }

    const blog = await prisma.blogPost.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    });

    // Fire webhook revalidation
    await RevalidationService.onBlogChange(blog.slug);
  }

  /**
   * Transition case study status to PUBLISHED.
   */
  static async publishCaseStudy(id: string): Promise<void> {
    const { isValid, issues } = await this.validateCaseStudy(id);
    if (!isValid) {
      const blockers = issues.filter(i => i.type === 'blocker').map(i => i.message);
      throw new AppError(`Cannot publish due to blockers: ${blockers.join(', ')}`, 'PUBLISH_BLOCKED', 400, issues);
    }

    const cs = await prisma.caseStudy.update({
      where: { id },
      data: {
        publishedAt: new Date()
      }
    });

    // Fire webhook revalidation
    await RevalidationService.onCaseStudyChange(cs.slug);
  }
}
