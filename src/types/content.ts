import { User } from './user';
import { SeoMeta, AeoGeoMeta, SchemaSettings } from './seo';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  contentJson: any; // JSON string or object for Tiptap
  contentHtml: string;
  contentText: string;
  excerpt: string;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  isFeatured: boolean;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: Date | string | null;
  scheduledAt?: Date | string | null;
  guestAuthor?: string | null;
  internalNote?: string | null;
  serviceIds: string[];
  caseStudyIds: string[];
  contentBriefUrl?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  authorId: string;
  author?: User;
  categoryId?: string | null;
  category?: Category | null;
  tags?: Tag[];
  seoMeta?: SeoMeta | null;
  aeoGeoMeta?: AeoGeoMeta | null;
  schemaSettings?: SchemaSettings | null;
}

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  clientName: string;
  anonymizeClient: boolean;
  clientLogo?: string | null;
  industry: string;
  engagementType: 'PROJECT' | 'RETAINER' | 'STAFF_AUGMENTATION' | 'PRODUCT_BUILD';
  publishedAt?: Date | string | null;
  scheduledAt?: Date | string | null;
  heroImage?: string | null;
  heroImageAlt?: string | null;
  excerpt: string;
  clientApprovalStatus: 'APPROVED' | 'PENDING' | 'ANONYMOUS';
  isFeatured: boolean;
  serviceIds: string[];
  blogPostIds: string[];
  internalNote?: string | null;
  challengeHtml: string;
  challengeJson: any;
  approachHtml: string;
  approachJson: any;
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Testimonial
  testimonialQuote?: string | null;
  testimonialName?: string | null;
  testimonialDesignation?: string | null;
  testimonialCompany?: string | null;
  testimonialImage?: string | null;

  // CTA
  ctaHeading?: string | null;
  ctaBody?: string | null;
  ctaButtonLabel?: string | null;
  ctaButtonUrl?: string | null;

  authorId: string;
  author?: User;
  resultStats?: ResultStat[];
  processSteps?: ProcessStep[];
  mediaGallery?: MediaGalleryItem[];
  seoMeta?: SeoMeta | null;
  aeoGeoMeta?: AeoGeoMeta | null;
  schemaSettings?: SchemaSettings | null;
  faqs?: CaseStudyFaq[];
}

export interface CaseStudyFaq {
  id: string;
  caseStudyId: string;
  question: string;
  answer: string;
  position: number;
}

export interface ResultStat {
  id: string;
  caseStudyId: string;
  value: string;
  label: string;
  description: string;
}

export interface ProcessStep {
  id: string;
  caseStudyId: string;
  title: string;
  description: string;
  icon?: string | null;
  position: number;
}

export interface MediaGalleryItem {
  id: string;
  caseStudyId: string;
  imagePath: string;
  caption?: string | null;
  alt?: string | null;
  position: number;
}

