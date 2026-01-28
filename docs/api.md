# LiveListen MVP - REST API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production: https://api.livelisten.com/api
```

## Authentication
MVP uses invite-based access. No authentication tokens required. User identity is established via first/last name on room join.

## API Endpoints

### Rooms

#### Create Room
```http
POST /api/rooms
Content-Type: application/json

{
  "hostFirstName": "John",
  "hostLastName": "Doe"
}
```

**Response:**
```json
{
  "room": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "inviteCode": "abc123xyz",
    "inviteLink": "https://livelisten.com/room/abc123xyz",
    "hostId": "660e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Status Codes:**
- `201 Created` - Room created successfully
- `400 Bad Request` - Invalid input (missing names, invalid format)

---

#### Get Room Details
```http
GET /api/rooms/:roomId
```

**Response:**
```json
{
  "room": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "inviteCode": "abc123xyz",
    "hostId": "660e8400-e29b-41d4-a716-446655440001",
    "episodeId": "770e8400-e29b-41d4-a716-446655440002",
    "title": "My Podcast Room",
    "settings": {
      "slowMode": false,
      "slowModeDelay": 5
    },
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "episode": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "title": "Episode Title",
      "audioUrl": "https://example.com/episode.mp3",
      "duration": 3600
    },
    "users": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "firstName": "John",
        "lastName": "Doe",
        "role": "host",
        "isMuted": false
      }
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Room found
- `404 Not Found` - Room doesn't exist
- `410 Gone` - Room is inactive/deleted

---

#### Join Room
```http
POST /api/rooms/:roomId/join
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response:**
```json
{
  "user": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "firstName": "Jane",
    "lastName": "Smith",
    "sessionId": "session_abc123"
  },
  "room": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "inviteCode": "abc123xyz"
  }
}
```

**Status Codes:**
- `200 OK` - Successfully joined room
- `400 Bad Request` - Invalid input
- `403 Forbidden` - User is banned from this room
- `404 Not Found` - Room doesn't exist
- `409 Conflict` - Room at capacity (>50 users)

---

#### Update Room Settings
```http
PATCH /api/rooms/:roomId/settings
Content-Type: application/json
Authorization: Bearer {host_token} (Future)

{
  "slowMode": true,
  "slowModeDelay": 10
}
```

**Response:**
```json
{
  "settings": {
    "slowMode": true,
    "slowModeDelay": 10
  }
}
```

**Status Codes:**
- `200 OK` - Settings updated
- `400 Bad Request` - Invalid settings
- `403 Forbidden` - Not the host
- `404 Not Found` - Room doesn't exist

---

### Episodes

#### Parse RSS Feed
```http
POST /api/episodes/rss
Content-Type: application/json

{
  "rssUrl": "https://example.com/podcast.rss"
}
```

**Response:**
```json
{
  "episodes": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "title": "Episode 1: Introduction",
      "description": "Episode description...",
      "audioUrl": "https://example.com/ep1.mp3",
      "duration": 3600,
      "publishedAt": "2025-01-10T08:00:00Z",
      "podcastTitle": "My Podcast",
      "podcastAuthor": "John Doe"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440003",
      "title": "Episode 2: Deep Dive",
      "description": "Episode description...",
      "audioUrl": "https://example.com/ep2.mp3",
      "duration": 4200,
      "publishedAt": "2025-01-12T08:00:00Z",
      "podcastTitle": "My Podcast",
      "podcastAuthor": "John Doe"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - RSS parsed successfully
- `400 Bad Request` - Invalid RSS URL or format
- `422 Unprocessable Entity` - RSS feed exists but couldn't be parsed

---

#### Get Episode Details
```http
GET /api/episodes/:episodeId
```

**Response:**
```json
{
  "episode": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "title": "Episode 1: Introduction",
    "description": "Episode description...",
    "audioUrl": "https://example.com/ep1.mp3",
    "duration": 3600,
    "publishedAt": "2025-01-10T08:00:00Z",
    "podcastTitle": "My Podcast",
    "podcastAuthor": "John Doe",
    "rssFeedUrl": "https://example.com/podcast.rss"
  }
}
```

**Status Codes:**
- `200 OK` - Episode found
- `404 Not Found` - Episode doesn't exist

---

#### Create Episode from MP3 URL
```http
POST /api/episodes
Content-Type: application/json

{
  "audioUrl": "https://example.com/episode.mp3",
  "title": "Custom Episode",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "episode": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "title": "Custom Episode",
    "description": "Optional description",
    "audioUrl": "https://example.com/episode.mp3",
    "duration": null, // Will be determined client-side or via metadata
    "publishedAt": null,
    "podcastTitle": null,
    "podcastAuthor": null
  }
}
```

**Status Codes:**
- `201 Created` - Episode created
- `400 Bad Request` - Invalid URL or missing required fields

---

#### Set Room Episode
```http
POST /api/rooms/:roomId/episode
Content-Type: application/json
Authorization: Bearer {host_token} (Future)

{
  "episodeId": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Response:**
```json
{
  "room": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "episodeId": "770e8400-e29b-41d4-a716-446655440002"
  },
  "episode": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "title": "Episode 1: Introduction",
    "audioUrl": "https://example.com/ep1.mp3",
    "duration": 3600
  }
}
```

**Status Codes:**
- `200 OK` - Episode set successfully
- `400 Bad Request` - Invalid episode ID
- `403 Forbidden` - Not the host
- `404 Not Found` - Room or episode doesn't exist

---

### Chat

#### Get Chat History
```http
GET /api/rooms/:roomId/messages?limit=50&before=2025-01-15T10:30:00Z
```

**Query Parameters:**
- `limit` (optional, default: 50, max: 100) - Number of messages to return
- `before` (optional) - ISO timestamp to fetch messages before this time

**Response:**
```json
{
  "messages": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "roomId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "660e8400-e29b-41d4-a716-446655440001",
      "user": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "content": "Great episode!",
      "isPinned": false,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "hasMore": false
}
```

**Status Codes:**
- `200 OK` - Messages retrieved
- `404 Not Found` - Room doesn't exist

---

### Users

#### Get User Details
```http
GET /api/users/:userId
```

**Response:**
```json
{
  "user": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

**Status Codes:**
- `200 OK` - User found
- `404 Not Found` - User doesn't exist

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "ROOM_NOT_FOUND",
    "message": "Room with ID 'abc123' not found",
    "details": {} // Optional additional error details
  }
}
```

## Common Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `ROOM_NOT_FOUND` - Room doesn't exist
- `ROOM_INACTIVE` - Room is inactive/deleted
- `ROOM_AT_CAPACITY` - Room has reached max users (50)
- `USER_BANNED` - User is banned from this room
- `FORBIDDEN` - User doesn't have permission (e.g., not host)
- `EPISODE_NOT_FOUND` - Episode doesn't exist
- `INVALID_RSS_FEED` - RSS feed URL is invalid or unparseable
- `INVALID_AUDIO_URL` - Audio URL is invalid or inaccessible
- `SERVER_ERROR` - Internal server error

## Rate Limiting

MVP: Basic rate limiting
- 100 requests per minute per IP
- 10 requests per minute for RSS parsing endpoint

Future: Per-user rate limiting with authentication

## CORS

Allowed origins (development):
- `http://localhost:3000`
- `http://localhost:3001`

Production: Configured for frontend domain only
