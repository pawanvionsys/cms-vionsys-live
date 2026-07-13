import { z } from 'zod';

export const blogFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-_]+$/, 'Slug can only contain lowercase letters, numbers, hyphens, and underscores'),
  excerpt: z.string().max(160, 'Excerpt cannot exceed 160 characters'),
  featuredImage: z.string().nullable().optional(),
  featuredImageAlt: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  guestAuthor: z.string().nullable().optional(),
  internalNote: z.string().nullable().optional(),
  serviceIds: z.array(z.string()).default([]),
  caseStudyIds: z.array(z.string()).default([]),
  contentBriefUrl: z.string().url('Must be a valid URL').or(z.literal('')).nullable().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  scheduledAt: z.string().nullable().optional()
});

export type BlogFormInput = z.infer<typeof blogFormSchema>;
