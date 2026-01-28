import { z } from 'zod';
import {
  RoomSchema,
  UserSchema,
  UserWithRoleSchema,
  PlaybackStateSchema,
  MessageSchema,
  RoomSettingsSchema,
  DiscussionPromptSchema,
  EvidenceLookupResponseSchema,
  ChatMessageSchema,
  PlaybackStateSchemaV2,
  RoomMemberSchema,
} from '../types';

// Socket Event Names
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  PING: 'ping',
  PONG: 'pong',

  // Room
  ROOM_JOIN: 'room:join',
  ROOM_JOINED: 'room:joined',
  ROOM_JOIN_ERROR: 'room:join_error',
  ROOM_STATE: 'room:state',
  ROOM_ERROR: 'room:error',

  // Playback
  PLAYBACK_PLAY: 'playback:play',
  PLAYBACK_PAUSE: 'playback:pause',
  PLAYBACK_SEEK: 'playback:seek',
  PLAYBACK_STATE: 'playback:state',
  PLAYBACK_SYNC_REQUEST: 'playback:sync_request',
  PLAYBACK_SYNC: 'playback:sync',

  // Chat (legacy/event-level)
  CHAT_MESSAGE: 'chat:message',
  CHAT_MESSAGE_ERROR: 'chat:message_error',
  CHAT_TYPING: 'chat:typing',

  // Chat (MVP contracts)
  CHAT_SEND: 'chat:send', // client → server
  CHAT_NEW: 'chat:new', // server → client

  // Users
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  USER_UPDATED: 'user:updated',

  // Moderation
  MODERATION_MUTE: 'moderation:mute',
  MODERATION_USER_MUTED: 'moderation:user_muted',
  MODERATION_KICK: 'moderation:kick',
  MODERATION_KICKED: 'moderation:kicked',
  MODERATION_USER_KICKED: 'moderation:user_kicked',
  MODERATION_BAN: 'moderation:ban',
  MODERATION_BANNED: 'moderation:banned',
  MODERATION_USER_BANNED: 'moderation:user_banned',
  MODERATION_SLOW_MODE: 'moderation:slow_mode',
  MODERATION_SLOW_MODE_UPDATED: 'moderation:slow_mode_updated',
  MODERATION_PIN_MESSAGE: 'moderation:pin_message',
  MODERATION_MESSAGE_PINNED: 'moderation:message_pinned',

  // Discussion
  DISCUSSION_PROMPT: 'discussion:prompt',
  DISCUSSION_EVIDENCE_LOOKUP: 'discussion:evidence_lookup',
  DISCUSSION_EVIDENCE_RESULT: 'discussion:evidence_result',

  // Presence
  PRESENCE_PING: 'presence:ping', // client → server
  PRESENCE_STATE: 'presence:state', // server → client

  // System
  ERROR: 'error',
} as const;

// Socket Event Schemas

// Room Events
export const RoomJoinEventSchema = z.object({
  userId: z.string().uuid(),
  roomId: z.string().uuid(),
});

export type RoomJoinEvent = z.infer<typeof RoomJoinEventSchema>;

export const RoomJoinedEventSchema = z.object({
  room: RoomSchema,
  users: z.array(UserWithRoleSchema),
  playbackState: PlaybackStateSchema.nullable(),
  messages: z.array(MessageSchema),
});

export type RoomJoinedEvent = z.infer<typeof RoomJoinedEventSchema>;

export const RoomJoinErrorEventSchema = z.object({
  code: z.enum(['USER_BANNED', 'ROOM_NOT_FOUND', 'ROOM_AT_CAPACITY']),
  message: z.string(),
});

export type RoomJoinErrorEvent = z.infer<typeof RoomJoinErrorEventSchema>;

export const RoomStateEventSchema = z.object({
  room: RoomSchema,
  users: z.array(UserWithRoleSchema),
  playbackState: PlaybackStateSchema.nullable(),
  settings: RoomSettingsSchema,
});

export type RoomStateEvent = z.infer<typeof RoomStateEventSchema>;

// Playback Events
export const PlaybackPlayEventSchema = z.object({
  roomId: z.string().uuid(),
  timestamp: z.number().nonnegative(),
});

export type PlaybackPlayEvent = z.infer<typeof PlaybackPlayEventSchema>;

export const PlaybackPauseEventSchema = z.object({
  roomId: z.string().uuid(),
  timestamp: z.number().nonnegative(),
});

export type PlaybackPauseEvent = z.infer<typeof PlaybackPauseEventSchema>;

export const PlaybackSeekEventSchema = z.object({
  roomId: z.string().uuid(),
  position: z.number().nonnegative(),
});

export type PlaybackSeekEvent = z.infer<typeof PlaybackSeekEventSchema>;

export const PlaybackStateEventSchema = PlaybackStateSchema;

export type PlaybackStateEvent = z.infer<typeof PlaybackStateEventSchema>;

export const PlaybackSyncRequestEventSchema = z.object({
  roomId: z.string().uuid(),
});

export type PlaybackSyncRequestEvent = z.infer<typeof PlaybackSyncRequestEventSchema>;

export const PlaybackSyncEventSchema = PlaybackStateSchema.extend({
  timestamp: z.number(),
});

export type PlaybackSyncEvent = z.infer<typeof PlaybackSyncEventSchema>;

// Chat Events
export const ChatMessageEventSchema = MessageSchema;

export type ChatMessageEvent = z.infer<typeof ChatMessageEventSchema>;

export const ChatMessageErrorEventSchema = z.object({
  code: z.enum(['USER_MUTED', 'SLOW_MODE', 'MESSAGE_TOO_LONG', 'FORBIDDEN']),
  message: z.string(),
});

export type ChatMessageErrorEvent = z.infer<typeof ChatMessageErrorEventSchema>;

export const ChatTypingEventSchema = z.object({
  roomId: z.string().uuid(),
  userId: z.string().uuid(),
  isTyping: z.boolean(),
});

export type ChatTypingEvent = z.infer<typeof ChatTypingEventSchema>;

export const UserTypingEventSchema = z.object({
  userId: z.string().uuid(),
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
  isTyping: z.boolean(),
});

export type UserTypingEvent = z.infer<typeof UserTypingEventSchema>;

// User Events
export const UserJoinedEventSchema = z.object({
  user: UserWithRoleSchema,
  totalUsers: z.number().int().nonnegative(),
});

export type UserJoinedEvent = z.infer<typeof UserJoinedEventSchema>;

export const UserLeftEventSchema = z.object({
  userId: z.string().uuid(),
  totalUsers: z.number().int().nonnegative(),
});

export type UserLeftEvent = z.infer<typeof UserLeftEventSchema>;

export const UserUpdatedEventSchema = z.object({
  user: UserWithRoleSchema,
});

export type UserUpdatedEvent = z.infer<typeof UserUpdatedEventSchema>;

// Moderation Events
export const ModerationMuteEventSchema = z.object({
  roomId: z.string().uuid(),
  targetUserId: z.string().uuid(),
  muted: z.boolean(),
});

export type ModerationMuteEvent = z.infer<typeof ModerationMuteEventSchema>;

export const UserMutedEventSchema = z.object({
  userId: z.string().uuid(),
  muted: z.boolean(),
  mutedBy: z.string().uuid(),
});

export type UserMutedEvent = z.infer<typeof UserMutedEventSchema>;

export const ModerationKickEventSchema = z.object({
  roomId: z.string().uuid(),
  targetUserId: z.string().uuid(),
});

export type ModerationKickEvent = z.infer<typeof ModerationKickEventSchema>;

export const UserKickedEventSchema = z.object({
  reason: z.string(),
  kickedBy: z.string().uuid(),
});

export type UserKickedEvent = z.infer<typeof UserKickedEventSchema>;

export const UserKickedBroadcastEventSchema = z.object({
  userId: z.string().uuid(),
  kickedBy: z.string().uuid(),
});

export type UserKickedBroadcastEvent = z.infer<typeof UserKickedBroadcastEventSchema>;

export const ModerationBanEventSchema = z.object({
  roomId: z.string().uuid(),
  targetUserId: z.string().uuid(),
  reason: z.string().optional(),
});

export type ModerationBanEvent = z.infer<typeof ModerationBanEventSchema>;

export const UserBannedEventSchema = z.object({
  reason: z.string(),
  bannedBy: z.string().uuid(),
});

export type UserBannedEvent = z.infer<typeof UserBannedEventSchema>;

export const UserBannedBroadcastEventSchema = z.object({
  userId: z.string().uuid(),
  bannedBy: z.string().uuid(),
});

export type UserBannedBroadcastEvent = z.infer<typeof UserBannedBroadcastEventSchema>;

export const ModerationSlowModeEventSchema = z.object({
  roomId: z.string().uuid(),
  enabled: z.boolean(),
  delaySeconds: z.number().int().min(1).max(60).optional(),
});

export type ModerationSlowModeEvent = z.infer<typeof ModerationSlowModeEventSchema>;

export const SlowModeUpdatedEventSchema = z.object({
  enabled: z.boolean(),
  delaySeconds: z.number().int().min(1).max(60),
});

export type SlowModeUpdatedEvent = z.infer<typeof SlowModeUpdatedEventSchema>;

export const ModerationPinMessageEventSchema = z.object({
  roomId: z.string().uuid(),
  messageId: z.string().uuid(),
  pinned: z.boolean(),
});

export type ModerationPinMessageEvent = z.infer<typeof ModerationPinMessageEventSchema>;

export const MessagePinnedEventSchema = z.object({
  messageId: z.string().uuid(),
  pinned: z.boolean(),
  pinnedBy: z.string().uuid(),
});

export type MessagePinnedEvent = z.infer<typeof MessagePinnedEventSchema>;

// Discussion Events
export const DiscussionPromptEventSchema = DiscussionPromptSchema;

export type DiscussionPromptEvent = z.infer<typeof DiscussionPromptEventSchema>;

export const DiscussionEvidenceLookupEventSchema = z.object({
  roomId: z.string().uuid(),
  query: z.string().min(1).max(500),
  context: z.string().max(1000).optional(),
});

export type DiscussionEvidenceLookupEvent = z.infer<typeof DiscussionEvidenceLookupEventSchema>;

export const DiscussionEvidenceResultEventSchema = EvidenceLookupResponseSchema;

export type DiscussionEvidenceResultEvent = z.infer<typeof DiscussionEvidenceResultEventSchema>;

// System Events
export const ErrorEventSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
});

export type ErrorEvent = z.infer<typeof ErrorEventSchema>;

export const PingEventSchema = z.object({
  timestamp: z.number(),
});

export type PingEvent = z.infer<typeof PingEventSchema>;

export const PongEventSchema = z.object({
  timestamp: z.number(),
  serverTime: z.number(),
});

export type PongEvent = z.infer<typeof PongEventSchema>;

// MVP Core Contracts (Agent 2)

// Client → Server

export const RoomJoinPayloadSchema = z.object({
  roomId: z.string().uuid(),
});

export type RoomJoinPayload = z.infer<typeof RoomJoinPayloadSchema>;

export const RoomLeavePayloadSchema = z.object({
  roomId: z.string().uuid(),
});

export type RoomLeavePayload = z.infer<typeof RoomLeavePayloadSchema>;

export const ChatSendPayloadSchema = z.object({
  roomId: z.string().uuid(),
  text: z.string().min(1).max(2000),
});

export type ChatSendPayload = z.infer<typeof ChatSendPayloadSchema>;

export const PresencePingPayloadSchema = z.object({
  roomId: z.string().uuid(),
});

export type PresencePingPayload = z.infer<typeof PresencePingPayloadSchema>;

export const PlaybackUpdatePayloadSchema = z.object({
  roomId: z.string().uuid(),
  isPlaying: z.boolean(),
  positionMs: z.number().int().nonnegative(),
});

export type PlaybackUpdatePayload = z.infer<typeof PlaybackUpdatePayloadSchema>;

// Server → Client

export const RoomJoinedPayloadSchema = z.object({
  roomId: z.string().uuid(),
  members: z.array(RoomMemberSchema),
});

export type RoomJoinedPayload = z.infer<typeof RoomJoinedPayloadSchema>;

export const PresenceStatePayloadSchema = z.object({
  roomId: z.string().uuid(),
  userIds: z.array(z.string().uuid()),
});

export type PresenceStatePayload = z.infer<typeof PresenceStatePayloadSchema>;

export const ChatNewPayloadSchema = ChatMessageSchema;

export type ChatNewPayload = z.infer<typeof ChatNewPayloadSchema>;

export const PlaybackStatePayloadSchema = PlaybackStateSchemaV2;

export type PlaybackStatePayload = z.infer<typeof PlaybackStatePayloadSchema>;

export const SocketErrorPayloadSchema = ErrorEventSchema;

export type SocketErrorPayload = z.infer<typeof SocketErrorPayloadSchema>;
