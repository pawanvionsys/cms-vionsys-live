import { siteConfig } from '../../config/site';

export class SchemaGenerator {
  /**
   * Generates organization schema context.
   */
  static getOrganizationSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${siteConfig.defaults.orgUrl}/#organization`,
      'name': siteConfig.defaults.orgName,
      'url': siteConfig.defaults.orgUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': siteConfig.defaults.orgLogoUrl,
      }
    };
  }

  /**
   * Generates BlogPosting schema for a blog.
   */
  static generateBlogPostingSchema(blog: {
    title: string;
    slug: string;
    excerpt: string;
    featuredImage?: string | null;
    publishedAt?: Date | string | null;
    updatedAt: Date | string;
    authorName: string;
  }) {
    const url = `${siteConfig.defaults.orgUrl}/blog/${blog.slug}`;
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${url}/#article`,
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': url
      },
      'headline': blog.title,
      'description': blog.excerpt,
      'image': blog.featuredImage || siteConfig.defaults.orgLogoUrl,
      'datePublished': blog.publishedAt || new Date().toISOString(),
      'dateModified': new Date(blog.updatedAt).toISOString(),
      'author': {
        '@type': 'Person',
        'name': blog.authorName
      },
      'publisher': this.getOrganizationSchema(),
    };
  }

  /**
   * Generates CaseStudy web schema.
   */
  static generateCaseStudySchema(cs: {
    title: string;
    slug: string;
    excerpt: string;
    heroImage?: string | null;
    publishedAt?: Date | string | null;
    updatedAt: Date | string;
    clientName: string;
    industry: string;
  }) {
    const url = `${siteConfig.defaults.orgUrl}/case-studies/${cs.slug}`;
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}/#webpage`,
      'url': url,
      'name': cs.title,
      'description': cs.excerpt,
      'image': cs.heroImage || siteConfig.defaults.orgLogoUrl,
      'publisher': this.getOrganizationSchema(),
      'about': {
        '@type': 'CreativeWork',
        'name': `Case study analysis for client: ${cs.clientName}`,
        'genre': cs.industry
      }
    };
  }

  /**
   * Generates FAQPage schema from inline FAQ items.
   */
  static generateFaqPageSchema(items: { question: string; answer: string }[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': items.map(item => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer
        }
      }))
    };
  }
}
