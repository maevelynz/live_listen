import { z } from 'zod';

// Episode DTOs
export const EpisodeSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().nullable(),
  audioUrl: z.string().url(),
  duration: z.number().int().positive().nullable(), // seconds
  publishedAt: z.string().datetime().nullable(),
  podcastTitle: z.string().max(500).nullable(),
  podcastAuthor: z.string().max(255).nullable(),
  rssFeedUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
});

export type Episode = z.infer<typeof EpisodeSchema>;

export const ParseRSSRequestSchema = z.object({
  rssUrl: z.string().url(),
});

export type ParseRSSRequest = z.infer<typeof ParseRSSRequestSchema>;

export const ParseRSSResponseSchema = z.object({
  episodes: z.array(EpisodeSchema),
});

export type ParseRSSResponse = z.infer<typeof ParseRSSResponseSchema>;

export const CreateEpisodeRequestSchema = z.object({
  audioUrl: z.string().url(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
});

export type CreateEpisodeRequest = z.infer<typeof CreateEpisodeRequestSchema>;

export const SetRoomEpisodeRequestSchema = z.object({
  episodeId: z.string().uuid(),
});

export type SetRoomEpisodeRequest = z.infer<typeof SetRoomEpisodeRequestSchema>;
