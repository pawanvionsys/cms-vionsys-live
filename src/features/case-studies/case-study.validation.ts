import { z } from 'zod';

export const resultStatSchema = z.object({
  value: z.string().min(1, 'Stat value is required (e.g. "+150%")'),
  label: z.string().min(1, 'Stat label is required (e.g. "Lead conversion")'),
  description: z.string().max(250, 'Stat description cannot exceed 250 characters').default('')
});

export const processStepSchema = z.object({
  title: z.string().min(1, 'Step title is required'),
  description: z.string().min(1, 'Step description is required'),
  icon: z.string().nullable().optional(),
  position: z.number().default(0)
});

export const mediaGalleryItemSchema = z.object({
  imagePath: z.string().min(1, 'Image path is required'),
  caption: z.string().nullable().optional(),
  alt: z.string().nullable().optional(),
  position: z.number().default(0)
});

export const caseStudyFaqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required')
});

export const caseStudyFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-_]+$/, 'Slug can only contain lowercase letters, numbers, hyphens, and underscores'),
  clientName: z.string().min(1, 'Client name is required'),
  clientLogo: z.string().nullable().optional(),
  industry: z.string().min(1, 'Industry is required'),
  engagementType: z.enum(['PROJECT', 'RETAINER', 'STAFF_AUGMENTATION', 'PRODUCT_BUILD']).default('PROJECT'),
  heroImage: z.string().nullable().optional(),
  heroImageAlt: z.string().nullable().optional(),
  excerpt: z.string().max(160, 'Excerpt cannot exceed 160 characters'),
  isFeatured: z.boolean().default(false),
  showMetricsOnTop: z.boolean().default(false),
  serviceIds: z.array(z.string()).default([]),
  blogPostIds: z.array(z.string()).default([]),
  internalNote: z.string().nullable().optional(),
  
  // Testimonial
  testimonialQuote: z.string().nullable().optional(),
  testimonialName: z.string().nullable().optional(),
  testimonialDesignation: z.string().nullable().optional(),
  testimonialCompany: z.string().nullable().optional(),
  testimonialImage: z.string().nullable().optional(),

  // CTA
  ctaHeading: z.string().nullable().optional(),
  ctaBody: z.string().nullable().optional(),
  ctaButtonLabel: z.string().nullable().optional(),
  ctaButtonUrl: z.string().nullable().optional(),

  // Arrays
  resultStats: z.array(resultStatSchema).default([]),
  processSteps: z.array(processStepSchema).default([]),
  mediaGallery: z.array(mediaGalleryItemSchema).default([]),
  faqs: z.array(caseStudyFaqSchema).default([])
});

export type CaseStudyFormInput = z.infer<typeof caseStudyFormSchema>;

