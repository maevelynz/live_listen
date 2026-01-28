import { z } from 'zod';

// Discussion DTOs
export const DiscussionPromptTypeSchema = z.enum(['timestamp', 'topic', 'question']);

export type DiscussionPromptType = z.infer<typeof DiscussionPromptTypeSchema>;

export const DiscussionPromptSchema = z.object({
  id: z.string().uuid(),
  type: DiscussionPromptTypeSchema,
  content: z.string().min(1),
  timestamp: z.number().nonnegative().optional(), // Episode timestamp in seconds
  metadata: z.record(z.any()).optional(),
});

export type DiscussionPrompt = z.infer<typeof DiscussionPromptSchema>;

export const EvidenceLookupRequestSchema = z.object({
  roomId: z.string().uuid(),
  query: z.string().min(1).max(500),
  context: z.string().max(1000).optional(),
});

export type EvidenceLookupRequest = z.infer<typeof EvidenceLookupRequestSchema>;

export const EvidenceResultSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  snippet: z.string(),
  source: z.string(),
});

export type EvidenceResult = z.infer<typeof EvidenceResultSchema>;

export const EvidenceLookupResponseSchema = z.object({
  query: z.string(),
  results: z.array(EvidenceResultSchema),
});

export type EvidenceLookupResponse = z.infer<typeof EvidenceLookupResponseSchema>;
