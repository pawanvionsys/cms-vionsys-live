import { prisma } from '../../lib/prisma';
import { siteConfig } from '../../config/site';
import { SitemapItem } from '../../types/api';

export class SitemapGenerator {
  /**
   * Compiles sitemap elements for consumption by dynamic XML/JSON endpoints.
   */
  static async generateSitemapData(): Promise<SitemapItem[]> {
    const sitemap: SitemapItem[] = [
      { url: `${siteConfig.defaults.orgUrl}`, changefreq: 'daily', priority: 1.0 },
      { url: `${siteConfig.defaults.orgUrl}/blog`, changefreq: 'daily', priority: 0.8 },
      { url: `${siteConfig.defaults.orgUrl}/case-studies`, changefreq: 'daily', priority: 0.8 },
    ];

    // Fetch published blogs
    const blogs = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

    for (const blog of blogs) {
      sitemap.push({
        url: `${siteConfig.defaults.orgUrl}/blog/${blog.slug}`,
        lastmod: new Date(blog.updatedAt).toISOString(),
        changefreq: 'weekly',
        priority: 0.6,
      });
    }

    // Fetch published case studies
    const caseStudies = await prisma.caseStudy.findMany({
      select: { slug: true, updatedAt: true, publishedAt: true },
    });
    // Filter published case studies (those with a publishedAt date)
    const publishedCaseStudies = caseStudies.filter(cs => cs.publishedAt != null);

    for (const cs of publishedCaseStudies) {
      sitemap.push({
        url: `${siteConfig.defaults.orgUrl}/case-studies/${cs.slug}`,
        lastmod: new Date(cs.updatedAt).toISOString(),
        changefreq: 'weekly',
        priority: 0.6,
      });
    }

    return sitemap;
  }
}
