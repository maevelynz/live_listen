import { z } from 'zod';

// Moderation DTOs
export const MuteUserRequestSchema = z.object({
  roomId: z.string().uuid(),
  targetUserId: z.string().uuid(),
  muted: z.boolean(),
});

export type MuteUserRequest = z.infer<typeof MuteUserRequestSchema>;

export const KickUserRequestSchema = z.object({
  roomId: z.string().uuid(),
  targetUserId: z.string().uuid(),
});

export type KickUserRequest = z.infer<typeof KickUserRequestSchema>;

export const BanUserRequestSchema = z.object({
  roomId: z.string().uuid(),
  targetUserId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

export type BanUserRequest = z.infer<typeof BanUserRequestSchema>;

export const ToggleSlowModeRequestSchema = z.object({
  roomId: z.string().uuid(),
  enabled: z.boolean(),
  delaySeconds: z.number().int().min(1).max(60).optional(),
});

export type ToggleSlowModeRequest = z.infer<typeof ToggleSlowModeRequestSchema>;

export const PinMessageRequestSchema = z.object({
  roomId: z.string().uuid(),
  messageId: z.string().uuid(),
  pinned: z.boolean(),
});

export type PinMessageRequest = z.infer<typeof PinMessageRequestSchema>;
