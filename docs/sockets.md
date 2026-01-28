# LiveListen MVP - Socket.IO Event Protocol

## Connection

### Client → Server: Connect
```typescript
socket.connect()
```

### Server → Client: Connection Acknowledged
```typescript
{
  event: 'connect',
  data: {
    socketId: string,
    serverTime: number // Unix timestamp in milliseconds
  }
}
```

## Room Namespace

All room-specific events occur in the `/room/:roomId` namespace.

### Client → Server: Join Room
```typescript
socket.emit('room:join', {
  userId: string,
  roomId: string
})
```

### Server → Client: Room Joined
```typescript
{
  event: 'room:joined',
  data: {
    room: RoomDTO,
    users: UserDTO[],
    playbackState: PlaybackStateDTO,
    messages: MessageDTO[] // Last 50 messages
  }
}
```

### Server → Client: Room Join Error
```typescript
{
  event: 'room:join_error',
  data: {
    code: 'USER_BANNED' | 'ROOM_NOT_FOUND' | 'ROOM_AT_CAPACITY',
    message: string
  }
}
```

---

## Playback Events

### Host → Server: Play
```typescript
socket.emit('playback:play', {
  roomId: string,
  timestamp: number // Current playback position in seconds
})
```

### Host → Server: Pause
```typescript
socket.emit('playback:pause', {
  roomId: string,
  timestamp: number // Current playback position in seconds
})
```

### Host → Server: Seek
```typescript
socket.emit('playback:seek', {
  roomId: string,
  position: number // New position in seconds
})
```

### Server → All Clients: Playback State Update
```typescript
{
  event: 'playback:state',
  data: {
    isPlaying: boolean,
    position: number, // Current position in seconds
    duration: number, // Total duration in seconds (if known)
    timestamp: number // Server timestamp when state was set
  }
}
```

### Client → Server: Sync Request
```typescript
socket.emit('playback:sync_request', {
  roomId: string
})
```

### Server → Client: Sync Response
```typescript
{
  event: 'playback:sync',
  data: {
    isPlaying: boolean,
    position: number,
    duration: number,
    timestamp: number
  }
}
```

---

## Chat Events

### Client → Server: Send Message
```typescript
socket.emit('chat:message', {
  roomId: string,
  userId: string,
  content: string
})
```

### Server → Client: New Message
```typescript
{
  event: 'chat:message',
  data: {
    id: string,
    roomId: string,
    userId: string,
    user: {
      firstName: string,
      lastName: string
    },
    content: string,
    isPinned: boolean,
    createdAt: string // ISO timestamp
  }
}
```

### Server → Client: Message Error
```typescript
{
  event: 'chat:message_error',
  data: {
    code: 'USER_MUTED' | 'SLOW_MODE' | 'MESSAGE_TOO_LONG' | 'FORBIDDEN',
    message: string
  }
}
```

### Client → Server: Typing Indicator (Optional)
```typescript
socket.emit('chat:typing', {
  roomId: string,
  userId: string,
  isTyping: boolean
})
```

### Server → Client: User Typing
```typescript
{
  event: 'chat:typing',
  data: {
    userId: string,
    user: {
      firstName: string,
      lastName: string
    },
    isTyping: boolean
  }
}
```

---

## User Events

### Server → All Clients: User Joined
```typescript
{
  event: 'user:joined',
  data: {
    user: UserDTO,
    totalUsers: number
  }
}
```

### Server → All Clients: User Left
```typescript
{
  event: 'user:left',
  data: {
    userId: string,
    totalUsers: number
  }
}
```

### Server → All Clients: User Updated
```typescript
{
  event: 'user:updated',
  data: {
    user: UserDTO // Updated user data (e.g., muted status)
  }
}
```

---

## Moderation Events (Host Only)

### Host → Server: Mute User
```typescript
socket.emit('moderation:mute', {
  roomId: string,
  targetUserId: string,
  muted: boolean
})
```

### Server → All Clients: User Muted
```typescript
{
  event: 'moderation:user_muted',
  data: {
    userId: string,
    muted: boolean,
    mutedBy: string // Host user ID
  }
}
```

### Host → Server: Kick User
```typescript
socket.emit('moderation:kick', {
  roomId: string,
  targetUserId: string
})
```

### Server → Target Client: User Kicked
```typescript
{
  event: 'moderation:kicked',
  data: {
    reason: string,
    kickedBy: string
  }
}
```

### Server → All Clients: User Kicked (Broadcast)
```typescript
{
  event: 'moderation:user_kicked',
  data: {
    userId: string,
    kickedBy: string
  }
}
```

### Host → Server: Ban User
```typescript
socket.emit('moderation:ban', {
  roomId: string,
  targetUserId: string,
  reason?: string
})
```

### Server → Target Client: User Banned
```typescript
{
  event: 'moderation:banned',
  data: {
    reason: string,
    bannedBy: string
  }
}
```

### Server → All Clients: User Banned (Broadcast)
```typescript
{
  event: 'moderation:user_banned',
  data: {
    userId: string,
    bannedBy: string
  }
}
```

### Host → Server: Toggle Slow Mode
```typescript
socket.emit('moderation:slow_mode', {
  roomId: string,
  enabled: boolean,
  delaySeconds?: number // Default: 5
})
```

### Server → All Clients: Slow Mode Updated
```typescript
{
  event: 'moderation:slow_mode_updated',
  data: {
    enabled: boolean,
    delaySeconds: number
  }
}
```

### Host → Server: Pin Message
```typescript
socket.emit('moderation:pin_message', {
  roomId: string,
  messageId: string,
  pinned: boolean
})
```

### Server → All Clients: Message Pinned
```typescript
{
  event: 'moderation:message_pinned',
  data: {
    messageId: string,
    pinned: boolean,
    pinnedBy: string
  }
}
```

---

## Discussion Features

### Server → Client: Discussion Prompt
```typescript
{
  event: 'discussion:prompt',
  data: {
    id: string,
    type: 'timestamp' | 'topic' | 'question',
    content: string,
    timestamp?: number, // Episode timestamp in seconds
    metadata?: Record<string, any>
  }
}
```

### Client → Server: Evidence Lookup Request (Future)
```typescript
socket.emit('discussion:evidence_lookup', {
  roomId: string,
  query: string,
  context?: string
})
```

### Server → Client: Evidence Lookup Response (Future)
```typescript
{
  event: 'discussion:evidence_result',
  data: {
    query: string,
    results: Array<{
      title: string,
      url: string,
      snippet: string,
      source: string
    }>
  }
}
```

---

## System Events

### Server → Client: Error
```typescript
{
  event: 'error',
  data: {
    code: string,
    message: string,
    details?: Record<string, any>
  }
}
```

### Server → Client: Room State
```typescript
{
  event: 'room:state',
  data: {
    room: RoomDTO,
    users: UserDTO[],
    playbackState: PlaybackStateDTO,
    settings: RoomSettingsDTO
  }
}
```

### Client → Server: Heartbeat
```typescript
socket.emit('ping', {
  timestamp: number
})
```

### Server → Client: Pong
```typescript
{
  event: 'pong',
  data: {
    timestamp: number,
    serverTime: number
  }
}
```

---

## Event Flow Examples

### Room Join Flow
```
1. Client: socket.connect()
2. Server: 'connect' event
3. Client: socket.emit('room:join', { userId, roomId })
4. Server: 'room:joined' event with full room state
5. Server (broadcast): 'user:joined' event to all other clients
```

### Playback Control Flow
```
1. Host: socket.emit('playback:play', { roomId, timestamp })
2. Server: Validate host permissions
3. Server (broadcast): 'playback:state' event to all clients
4. All clients: Update local player state
```

### Chat Message Flow
```
1. Client: socket.emit('chat:message', { roomId, userId, content })
2. Server: Validate (not muted, slow mode check, etc.)
3. Server: Save message to database
4. Server (broadcast): 'chat:message' event to all clients
```

### Moderation Flow (Mute)
```
1. Host: socket.emit('moderation:mute', { roomId, targetUserId, muted: true })
2. Server: Validate host permissions
3. Server: Update database
4. Server (broadcast): 'moderation:user_muted' event
5. Server: 'user:updated' event with updated user data
```

---

## Error Handling

### Connection Errors
- `connect_error` - Connection failed
- `disconnect` - Disconnected from server
- `reconnect` - Reconnected after disconnection
- `reconnect_error` - Reconnection failed

### Room Errors
- `room:join_error` - Failed to join room
- `room:error` - General room error

### Permission Errors
- Events that require host permissions will emit `error` event with code `FORBIDDEN`

---

## Type Definitions

See `packages/shared` for complete TypeScript type definitions and Zod validators for all events.
