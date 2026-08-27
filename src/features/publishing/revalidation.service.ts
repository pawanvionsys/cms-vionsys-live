import { siteConfig } from '../../config/site';
import { logger } from '../../lib/logger';

export class RevalidationService {
  /**
   * Dispatches a webhook to the public website requesting cache revalidation.
   * vionsys.com expects POST /api/revalidate/cms with x-revalidate-secret header.
   */
  static async triggerRevalidate(
    paths: string[],
    meta?: {
      action?: 'delete' | 'publish' | 'update';
      contentType?: 'blog' | 'case-study';
      slug?: string;
    }
  ): Promise<boolean> {
    const url = siteConfig.revalidateUrl;
    const secret = siteConfig.revalidateSecret;

    if (!url) {
      logger.warn('Revalidation URL is not configured. Skipping cache purging.');
      return false;
    }

    const body: Record<string, unknown> = { paths };
    if (meta?.action) body.action = meta.action;
    if (meta?.contentType) body.contentType = meta.contentType;
    if (meta?.slug) body.slug = meta.slug;
    if (meta?.contentType === 'blog' && meta.slug) body.blogSlug = meta.slug;
    if (meta?.contentType === 'case-study' && meta.slug) body.caseStudySlug = meta.slug;

    try {
      logger.info(`Triggering frontend revalidation at ${url} for paths: ${paths.join(', ')}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
          'x-vionsys-cms-key': secret,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const text = await response.text();
        logger.error(`Revalidation failed with status ${response.status}: ${text}`);
        return false;
      }

      const result = await response.json();
      logger.info('Revalidation completed successfully:', result);
      return true;
    } catch (err: any) {
      logger.error('Error triggering revalidation:', err);
      return false;
    }
  }

  static async onBlogChange(slug: string, oldSlug?: string) {
    const paths = ['/', '/blog', `/blog/${slug}`, '/sitemap.xml', '/sitemap-blog.xml'];
    if (oldSlug && oldSlug !== slug) {
      paths.push(`/blog/${oldSlug}`);
    }
    return this.triggerRevalidate(paths, { action: 'update', contentType: 'blog', slug });
  }

  static async onBlogDelete(slug: string) {
    return this.triggerRevalidate(
      ['/', '/blog', `/blog/${slug}`, '/sitemap.xml', '/sitemap-blog.xml'],
      { action: 'delete', contentType: 'blog', slug }
    );
  }

  static async onCaseStudyChange(slug: string, oldSlug?: string) {
    const paths = [
      '/',
      '/case-studies',
      `/case-studies/${slug}`,
      '/sitemap.xml',
      '/sitemap-case-studies.xml',
    ];
    if (oldSlug && oldSlug !== slug) {
      paths.push(`/case-studies/${oldSlug}`);
    }
    return this.triggerRevalidate(paths, { action: 'update', contentType: 'case-study', slug });
  }

  static async onCaseStudyDelete(slug: string) {
    return this.triggerRevalidate(
      ['/', '/case-studies', `/case-studies/${slug}`, '/sitemap.xml', '/sitemap-case-studies.xml'],
      { action: 'delete', contentType: 'case-study', slug }
    );
  }
}
