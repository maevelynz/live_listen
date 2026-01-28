# LiveListen - UX Flows

This doc describes the MVP user experience flows for **Host** and **Participant**, including core journeys and key edge cases.

## Personas

### Host
- **Goal**: Start a listening session, invite others, keep the room on-track.
- **Primary needs**:
  - Create room quickly
  - Share invite code/link
  - See who is present
  - Control playback (play/pause/seek)
  - Moderate disruptions (mute/kick/lock)
- **Pain points**:
  - Confusion if playback isn’t synchronized
  - Unclear whether others joined successfully
  - Loss of control if the host disconnects

### Participant
- **Goal**: Join a room from an invite and listen/chat in sync.
- **Primary needs**:
  - Join reliably via invite code
  - See presence and chat history
  - Know who the host is
  - Understand playback state (synced vs. buffering)
- **Pain points**:
  - Invalid invite code
  - Being out-of-sync and not knowing why
  - Host disconnect causing uncertainty

## Core Flows

### 1) Onboarding (Real-name)

**Entry point**: First time loading the web app.

**Steps**:
1. User sees a simple form: **“Enter your real name”**
2. User enters `Full name` and taps **Continue**
3. App calls `POST /auth/register`
4. On success:
   - Store `token` (localStorage for pilot)
   - Store `user` (id + fullName)
   - Navigate to **Home / Rooms**
5. On failure:
   - Inline error message (e.g., “API unreachable” / validation error)
   - Offer retry

**UX notes**:
- The form should explain why: “Real names keep rooms civil.”
- Keep the interaction < 10 seconds.

### 2) Create Room + Invite

**Entry point**: Home / Rooms screen.

**Steps**:
1. Host taps **Create room**
2. Host enters `Room title` (optional in MVP, but recommended)
3. App calls `POST /rooms`
4. On success:
   - Show a **Room card** with `Invite code` and **Copy** action
   - Provide “Open room” button (navigates to room screen)
5. Share flow:
   - Host taps **Copy invite code** (toast: “Copied”)
   - Optionally, show full invite instructions (“Send this code to friends”)

**UX notes**:
- Show a **success toast** on creation.
- Invite code should be highly readable (monospace, grouped).

### 3) Join Room

**Entry point**: Home / Rooms screen.

**Steps**:
1. Participant taps **Join room**
2. Inputs `Invite code`
3. App calls `POST /rooms/join`
4. On success:
   - Navigate to room screen
5. On error:
   - Invalid code → toast + inline message
   - Room locked/full → toast + inline message

**UX notes**:
- Auto-uppercase invite code if format supports it.
- Support paste; trim whitespace.

### 4) “Listen Together” Session

**Entry point**: Room screen.

**Primary layout zones**:
- Header: Room title + invite code + connection status
- Main: Playback
- Side: Presence + Chat
- Host-only: moderation controls

**Steps**:
1. App loads room screen and connects Socket.IO with token
2. App emits `room:join { roomId }`
3. Server replies `room:joined` + `presence:state`
4. App loads last messages via `GET /rooms/:roomId/messages`
5. During session:
   - Presence updates shown via `presence:state`
   - Chat:
     - User sends message → `chat:send`
     - All receive `chat:new` (append)
   - Playback:
     - Host adjusts → `playback:update`
     - All receive `playback:state` (update UI)

**UX notes**:
- Presence should display full names (pilot), sorted with host pinned on top.
- Playback should clearly show **Synced** / **Reconnecting** / **Out of sync** states.
- Chat should show system messages for moderation events (e.g., “Alex was muted by Host”).

### 5) Leave Room / End Session

**Entry point**: Room screen.

**Participant leave**:
1. Participant taps **Leave**
2. App emits `room:leave`
3. Navigate back to Home / Rooms

**Host end session** (MVP):
- MVP can treat host leaving as “session ended” only by convention:
  - If host leaves, show “Host disconnected” banner to participants
  - Participants may continue chatting (optional), but playback controls are disabled

**UX notes**:
- Provide confirmation modal for host: “End session?”

## Edge Flows

### A) Invite Code Invalid / Expired

**Trigger**: `POST /rooms/join` returns 400/404 or socket emits `error`.

**UI**:
- Inline error under invite input: “Invite code not found.”
- Toast: “Couldn’t join room. Check the code and try again.”
- Focus the invite input.

**Recovery**:
- Allow re-try, paste again.
- Link to “Ask host for a new code” (copyable hint).

### B) Host Disconnect

**Trigger**: Presence no longer includes host userId OR server emits a host-left signal.

**UI**:
- Persistent banner: “Host disconnected. Playback controls paused.”
- Disable participant playback controls (they were read-only anyway)
- Chat remains available unless room is locked/ended

**Recovery**:
- If host reconnects, banner disappears and session resumes.

### C) Reconnect (Client)

**Trigger**: Socket disconnect/reconnect events.

**UI**:
- Show small status indicator in header:
  - “Reconnecting…” (spinner)
  - “Connected” (green)
  - “Offline” (red)

**Logic**:
- On reconnect:
  - re-auth socket (token)
  - re-emit `room:join`
  - refresh presence and playback state

### D) Abusive Participant

**Trigger**: Host observes abusive chat or receives reports (future).

**Host actions**:
1. Mute → user can’t send messages (show them a message: “You’re muted.”)
2. Kick → user removed; can rejoin unless banned
3. Ban → user blocked from rejoining
4. Lock room → prevent new joins during disruption

**Participant experience**:
- If muted: show inline error on send attempt (“Muted by host.”)
- If kicked/banned: modal explaining removal and how to contact host (if applicable)

**Audit cues**:
- Chat shows system line item (non-blaming): “A participant was removed by host.”

