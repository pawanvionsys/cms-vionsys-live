import { siteConfig } from '../../config/site';
import { logger } from '../../lib/logger';

export class RevalidationService {
  /**
   * Dispatches a webhook to the public frontend requesting cache revalidation of specific routes.
   */
  static async triggerRevalidate(paths: string[]): Promise<boolean> {
    const url = siteConfig.revalidateUrl;
    const secret = siteConfig.revalidateSecret;

    if (!url) {
      logger.warn('Revalidation URL is not configured. Skipping cache purging.');
      return false;
    }

    try {
      logger.info(`Triggering frontend revalidation for paths: ${paths.join(', ')}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secret}`
        },
        body: JSON.stringify({ paths }),
        // Set a low timeout so we don't block user response
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        const text = await response.text();
        logger.error(`Revalidation failed with status ${response.status}: ${text}`);
        return false;
      }

      const result = await response.json();
      logger.info(`Revalidation completed successfully:`, result);
      return true;
    } catch (err: any) {
      logger.error('Error triggering revalidation:', err);
      return false;
    }
  }

  /**
   * Helper to trigger revalidation for blog changes.
   */
  static async onBlogChange(slug: string, oldSlug?: string) {
    const paths = [
      '/blog',
      `/blog/${slug}`,
      '/sitemap.xml',
      '/sitemap-blog.xml'
    ];
    if (oldSlug && oldSlug !== slug) {
      paths.push(`/blog/${oldSlug}`);
    }
    return this.triggerRevalidate(paths);
  }

  /**
   * Helper to trigger revalidation for case study changes.
   */
  static async onCaseStudyChange(slug: string, oldSlug?: string) {
    const paths = [
      '/case-studies',
      `/case-studies/${slug}`,
      '/sitemap.xml',
      '/sitemap-case-studies.xml'
    ];
    if (oldSlug && oldSlug !== slug) {
      paths.push(`/case-studies/${oldSlug}`);
    }
    return this.triggerRevalidate(paths);
  }
}
