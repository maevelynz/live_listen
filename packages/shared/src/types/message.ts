import { z } from 'zod';

// Message DTOs
export const MessageSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  userId: z.string().uuid(),
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
  content: z.string().min(1).max(2000),
  isPinned: z.boolean(),
  createdAt: z.string().datetime(),
});

export type Message = z.infer<typeof MessageSchema>;

export const SendMessageRequestSchema = z.object({
  roomId: z.string().uuid(),
  userId: z.string().uuid(),
  content: z.string().min(1).max(2000),
});

export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

export const GetMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().datetime().optional(),
});

export type GetMessagesQuery = z.infer<typeof GetMessagesQuerySchema>;

export const GetMessagesResponseSchema = z.object({
  messages: z.array(MessageSchema),
  hasMore: z.boolean(),
});

export type GetMessagesResponse = z.infer<typeof GetMessagesResponseSchema>;
