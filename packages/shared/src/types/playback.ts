import { z } from 'zod';

// Playback DTOs
export const PlaybackStateSchema = z.object({
  isPlaying: z.boolean(),
  position: z.number().nonnegative(), // seconds
  duration: z.number().positive().nullable(), // seconds
  timestamp: z.number(), // Unix timestamp in milliseconds
});

export type PlaybackState = z.infer<typeof PlaybackStateSchema>;

export const PlaybackPlayRequestSchema = z.object({
  roomId: z.string().uuid(),
  timestamp: z.number().nonnegative(),
});

export type PlaybackPlayRequest = z.infer<typeof PlaybackPlayRequestSchema>;

export const PlaybackPauseRequestSchema = z.object({
  roomId: z.string().uuid(),
  timestamp: z.number().nonnegative(),
});

export type PlaybackPauseRequest = z.infer<typeof PlaybackPauseRequestSchema>;

export const PlaybackSeekRequestSchema = z.object({
  roomId: z.string().uuid(),
  position: z.number().nonnegative(),
});

export type PlaybackSeekRequest = z.infer<typeof PlaybackSeekRequestSchema>;

export const PlaybackSyncRequestSchema = z.object({
  roomId: z.string().uuid(),
});

export type PlaybackSyncRequest = z.infer<typeof PlaybackSyncRequestSchema>;
