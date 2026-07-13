import { ContentBlock } from './blocks';

export interface EditorStats {
  wordCount: number;
  charCount: number;
  readingTimeMin: number;
  readabilityScore: number; // 0-100 Flesch Reading Ease
  readabilityGrade: string; // e.g. "Easy", "Fairly Easy", "Hard"
  keywordDensity: { keyword: string; count: number; density: number }[];
  headingStructure: { level: number; text: string; isValid: boolean }[];
  hasMissingAltTags: boolean;
}

export interface EditorState {
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  categoryId?: string | null;
  tags: string[];
  isFeatured: boolean;
  guestAuthor?: string | null;
  internalNote?: string | null;
  serviceIds: string[];
  caseStudyIds: string[];
  contentBriefUrl?: string | null;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  scheduledAt?: string | Date | null;
  publishedAt?: string | Date | null;
}

export interface CaseStudyEditorState {
  title: string;
  slug: string;
  clientName: string;
  anonymizeClient: boolean;
  clientLogo?: string | null;
  industry: string;
  engagementType: 'PROJECT' | 'RETAINER' | 'STAFF_AUGMENTATION' | 'PRODUCT_BUILD';
  heroImage?: string | null;
  heroImageAlt?: string | null;
  excerpt: string;
  clientApprovalStatus: 'APPROVED' | 'PENDING' | 'ANONYMOUS';
  isFeatured: boolean;
  serviceIds: string[];
  blogPostIds: string[];
  internalNote?: string | null;
  
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

  // Repeatable sections
  resultStats: { value: string; label: string; description: string }[];
  processSteps: { title: string; description: string; icon?: string }[];
  mediaGallery: { imagePath: string; caption?: string; alt?: string }[];
  faqs: { question: string; answer: string }[];
}

