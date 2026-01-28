import { z } from 'zod';

// Error DTOs
export const ErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'ROOM_NOT_FOUND',
  'ROOM_INACTIVE',
  'ROOM_AT_CAPACITY',
  'USER_BANNED',
  'FORBIDDEN',
  'EPISODE_NOT_FOUND',
  'INVALID_RSS_FEED',
  'INVALID_AUDIO_URL',
  'USER_MUTED',
  'SLOW_MODE',
  'MESSAGE_TOO_LONG',
  'SERVER_ERROR',
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string(),
    details: z.record(z.any()).optional(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
