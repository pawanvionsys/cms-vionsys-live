import { siteConfig } from '../../config/site';

export class RobotsGenerator {
  /**
   * Outputs the robots.txt rule mapping.
   */
  static generateRobotsTxt(): string {
    return [
      'User-agent: *',
      'Allow: /',
      'Disallow: /api/v1/private/',
      'Disallow: /admin/',
      '',
      `Sitemap: ${siteConfig.defaults.orgUrl}/sitemap.xml`
    ].join('\n');
  }
}
