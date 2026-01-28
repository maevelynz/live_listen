import { z } from 'zod';

// Room DTOs
export const RoomSettingsSchema = z.object({
  slowMode: z.boolean().default(false),
  slowModeDelay: z.number().int().min(1).max(60).default(5), // seconds
});

export type RoomSettings = z.infer<typeof RoomSettingsSchema>;

export const RoomSchema = z.object({
  id: z.string().uuid(),
  inviteCode: z.string().min(1),
  hostId: z.string().uuid(),
  episodeId: z.string().uuid().nullable(),
  episodeUrl: z.string().url().nullable(),
  title: z.string().nullable(),
  settings: RoomSettingsSchema,
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Room = z.infer<typeof RoomSchema>;

export const CreateRoomRequestSchema = z.object({
  hostFirstName: z.string().min(1).max(100),
  hostLastName: z.string().min(1).max(100),
});

export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;

export const CreateRoomResponseSchema = z.object({
  room: z.object({
    id: z.string().uuid(),
    inviteCode: z.string(),
    inviteLink: z.string().url(),
    hostId: z.string().uuid(),
    createdAt: z.string().datetime(),
  }),
});

export type CreateRoomResponse = z.infer<typeof CreateRoomResponseSchema>;

export const JoinRoomRequestSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

export type JoinRoomRequest = z.infer<typeof JoinRoomRequestSchema>;

export const UpdateRoomSettingsRequestSchema = z.object({
  slowMode: z.boolean().optional(),
  slowModeDelay: z.number().int().min(1).max(60).optional(),
});

export type UpdateRoomSettingsRequest = z.infer<typeof UpdateRoomSettingsRequestSchema>;
