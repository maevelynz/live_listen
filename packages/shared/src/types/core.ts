import { z } from 'zod';

// Core/shared DTOs used by both HTTP API and Socket.IO

export const UserIdentitySchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1).max(200),
  createdAt: z.string().datetime(),
});

export type UserIdentity = z.infer<typeof UserIdentitySchema>;

export const CoreRoomSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  inviteCode: z.string().min(1),
  hostUserId: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type CoreRoom = z.infer<typeof CoreRoomSchema>;

export const RoomMemberRoleSchema = z.enum(['host', 'member']);

export type RoomMemberRole = z.infer<typeof RoomMemberRoleSchema>;

export const RoomMemberSchema = z.object({
  roomId: z.string().uuid(),
  userId: z.string().uuid(),
  role: RoomMemberRoleSchema,
  joinedAt: z.string().datetime(),
});

export type RoomMember = z.infer<typeof RoomMemberSchema>;

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  userId: z.string().uuid(),
  text: z.string().min(1).max(2000),
  createdAt: z.string().datetime(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const PlaybackStateSchemaV2 = z.object({
  roomId: z.string().uuid(),
  isPlaying: z.boolean(),
  positionMs: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid(),
});

export type PlaybackStateV2 = z.infer<typeof PlaybackStateSchemaV2>;

