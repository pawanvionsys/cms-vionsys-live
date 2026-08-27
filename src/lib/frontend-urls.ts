const FRONTEND_BASE = (
  process.env.NEXT_PUBLIC_VIONSYS_FRONTEND_BASE_URL ||
  process.env.VIONSYS_FRONTEND_BASE_URL ||
  'https://www.vionsys.com'
).replace(/\/+$/, '');

export function isPublishedContent(
  status: string | undefined,
  publishedAt?: string | Date | null
): boolean {
  return status === 'PUBLISHED' || Boolean(publishedAt);
}

export function getBlogLiveUrl(slug: string): string {
  return `${FRONTEND_BASE}/blog/${slug}`;
}

export function getCaseStudyLiveUrl(slug: string): string {
  return `${FRONTEND_BASE}/case-studies/${slug}`;
}
