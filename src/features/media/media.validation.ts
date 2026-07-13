import { z } from 'zod';

export const mediaAssetUpdateSchema = z.object({
  alt: z.string().max(250, 'Alt text cannot exceed 250 characters').nullable().optional(),
  caption: z.string().max(500, 'Caption cannot exceed 500 characters').nullable().optional(),
  tags: z.array(z.string()).default([]),
  folderId: z.string().nullable().optional()
});

export type MediaAssetUpdateInput = z.infer<typeof mediaAssetUpdateSchema>;
