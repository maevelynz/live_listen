import { z } from 'zod';

// User DTOs
export const UserSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  sessionId: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const RoomUserSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  userId: z.string().uuid(),
  user: UserSchema,
  role: z.enum(['host', 'participant']),
  isMuted: z.boolean(),
  isBanned: z.boolean(),
  joinedAt: z.string().datetime(),
});

export type RoomUser = z.infer<typeof RoomUserSchema>;

export const UserWithRoleSchema = UserSchema.extend({
  role: z.enum(['host', 'participant']),
  isMuted: z.boolean(),
});

export type UserWithRole = z.infer<typeof UserWithRoleSchema>;
