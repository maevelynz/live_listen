# LiveListen - UI Spec (MVP)

This doc defines the **information architecture**, **layout wireframes**, **components**, **interaction rules**, and **accessibility** requirements for the LiveListen MVP web app.

## Information Architecture

### Screens
- **Onboarding**
  - Real-name entry (first-run gate)
- **Home / Rooms**
  - Room list (rooms the user is a member of)
  - Create room (modal or inline)
  - Join room by invite code
- **Room**
  - Presence + chat + playback sync experience
  - Host tools (host-only)
- **Profile / Settings**
  - Display name (read-only in MVP or allow rename if supported)
  - Toggles (sound, reduced motion, staging banner)
  - Sign out (clears token)

### Navigation Model
- **Onboarding → Home** after successful registration.
- **Home → Room** on selecting/creating/joining.
- **Room → Home** via “Leave” action.
- **Settings** accessible from Home and Room header (icon).

## Layout Wireframes (Text)

### 1) Onboarding (Real-name)

```
┌──────────────────────────────────┐
│ LiveListen                        │
│                                  │
│  Enter your real name            │
│  [ Full name input___________ ]  │
│  (Why: keeps rooms civil)        │
│                                  │
│  [ Continue ]                    │
│                                  │
│  Error text (inline)             │
└──────────────────────────────────┘
```

### 2) Home / Rooms

Mobile:
```
┌──────────────────────────────────┐
│ LiveListen          [⚙]          │
│ (optional env badge)             │
├──────────────────────────────────┤
│ Your rooms                       │
│ [ Room card ]                    │
│ [ Room card ]                    │
│                                  │
│ Create room                      │
│ [ Title________ ] [ Create ]     │
│                                  │
│ Join with invite code            │
│ [ Code_________ ] [ Join ]       │
└──────────────────────────────────┘
```

Desktop:
```
┌────────────────────────────────────────────────────────────┐
│ LiveListen                                      [⚙]         │
├───────────────────────────────┬─────────────────────────────┤
│ Your rooms                    │ Create / Join               │
│ [ Room card ]                 │  Create room                │
│ [ Room card ]                 │  [ Title___ ] [ Create ]    │
│                               │                             │
│                               │  Join room                  │
│                               │  [ Code____ ] [ Join ]      │
└───────────────────────────────┴─────────────────────────────┘
```

### 3) Room

Mobile:
```
┌──────────────────────────────────┐
│ ← Back   Room Title      [⚙]    │
│ Invite: ABC123   [Copy]          │
│ Status: Connected                │
├──────────────────────────────────┤
│ Playback                         │
│ [ Play/Pause ]                   │
│ [ Seek slider________________ ]  │
│ (Host-only controls)             │
├──────────────────────────────────┤
│ Presence                         │
│ Host: Name                       │
│ Others…                          │
├──────────────────────────────────┤
│ Chat                             │
│ [ bubbles… ]                     │
│ [ input___________ ] [ Send ]    │
└──────────────────────────────────┘
```

Desktop:
```
┌────────────────────────────────────────────────────────────┐
│ ← Back  Room Title   Invite: ABC123 [Copy]   Status ●        │
├───────────────────────────────┬─────────────────────────────┤
│ Playback                      │ Presence                    │
│ [ Play/Pause ] [ Seek slider] │ Host (pinned)               │
│ Host tools (if host)          │ Members list                │
│                               ├─────────────────────────────┤
│                               │ Chat                        │
│                               │ [ messages ]                │
│                               │ [ input ] [ Send ]          │
└───────────────────────────────┴─────────────────────────────┘
```

### 4) Profile / Settings

```
┌──────────────────────────────────┐
│ ← Back      Settings             │
├──────────────────────────────────┤
│ Name: Jane Doe                   │
│ (read-only in MVP)               │
│                                  │
│ Reduced motion      [ on/off ]   │
│ Sound effects       [ on/off ]   │
│ Show env banner     [ on/off ]   │
│                                  │
│ [ Sign out ]                     │
└──────────────────────────────────┘
```

## Component List

### Home / Rooms
- **AppHeader**
  - Brand
  - Env badge (local/staging)
  - Settings button
- **RoomCard**
  - Title
  - Invite code (monospace)
  - Role badge (Host / Member)
  - Open button
- **CreateRoomForm**
  - Title input
  - Create button
  - Loading + inline errors
- **JoinRoomForm**
  - Invite code input
  - Join button
  - Loading + inline errors
- **SkeletonRoomList**
  - 3–5 placeholder cards

### Room
- **RoomHeader**
  - Back
  - Room title
  - Invite code component + Copy button
  - Connection status indicator
- **InviteCode**
  - Displays invite code
  - Copy action + toast
- **PresenceList**
  - Host pinned at top
  - Members list
  - Optional count
- **ChatPanel**
  - Message list
  - Message input row
- **ChatBubble**
  - User name
  - Message text
  - Timestamp (optional; show on hover for desktop)
  - System message variant (muted/kicked/etc.)
- **PlaybackBar**
  - Play/Pause
  - Seek slider
  - “Synced” / “Reconnecting” label
- **HostControls** (host-only)
  - Mute/kick/ban actions (MVP can be minimal)
  - Lock room toggle

### Settings
- **SettingsList**
  - Toggle rows
  - Sign out button

## Interaction Rules

### Toasts (When to show)
- **Success**
  - Invite code copied
  - Room created
  - Joined room
- **Errors**
  - Join failure (invalid code / locked / full)
  - Message send error (rate limit, muted)
  - Socket disconnected (optional; prefer subtle banner)

### Loading States
- **Onboarding**
  - Disable Continue, show spinner on submit
- **Room list**
  - Show skeleton cards while loading
- **Create / Join**
  - Disable button, show inline spinner
- **Room enter**
  - Show “Connecting…” state until `room:joined` + initial messages fetched

### Empty States
- **No rooms**
  - “No rooms yet. Create one or join with a code.”
- **No messages**
  - “No messages yet—say hello.”
- **Presence only you**
  - “Waiting for others…”

### Error States
- **API down**
  - Persistent banner: “Can’t reach API. Check that the backend is running.”
  - Provide Retry button for room list.
- **Socket down**
  - Header status: “Reconnecting…”
  - Attempt automatic reconnect.

### Connection Status Rules
- Connected: green dot + “Connected”
- Reconnecting: amber dot + “Reconnecting…”
- Offline: red dot + “Offline”

## Accessibility (A11y)

### Keyboard Navigation
- All interactive elements must be reachable via Tab.
- Visible focus ring (do not remove outline).
- Enter submits forms; Escape closes modals (if used).
- Room chat:
  - Input focused by default
  - Enter sends message
  - Shift+Enter adds newline (optional; MVP can be single-line)

### Color Contrast
- Ensure text meets WCAG AA:
  - Body text contrast ≥ 4.5:1
  - Large text contrast ≥ 3:1
- Status dots should also have text labels (not color-only).

### Reduced Motion
- Respect `prefers-reduced-motion`.
- Avoid auto-scrolling animations; if auto-scroll chat, do it instantly.
- Disable decorative gradients/animations if reduced motion enabled (optional).

### Screen Reader Support
- Provide aria-labels for icon buttons (copy, settings, close toast).
- Connection status announced via `aria-live="polite"` (optional).
- Toasts should be readable (aria-live region).

