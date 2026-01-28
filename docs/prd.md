# LiveListen MVP - Product Requirements Document

## Overview
LiveListen is a B2C application that enables synchronized podcast listening with real-time chat and grounded discussion features. Users join invite-only rooms where they co-listen to podcast episodes in sync, chat with other listeners, and engage with proactive discussion prompts and evidence lookup tools.

## MVP Scope

### Core Features

#### 1. Room Management
- **Invite-only rooms**: Users join via invite links
- **Room creation**: Host creates room and receives invite link
- **Room capacity**: Maximum 50 users per room (pilot limit)
- **Real-name identity**: First name and last name required for all users
- **Room persistence**: Rooms persist across sessions

#### 2. Synchronized Playback
- **Host controls**: Only host can play, pause, and seek
- **Sync mechanism**: All users' players sync to host's playback position
- **Playback state**: Real-time synchronization of play/pause state
- **Seek handling**: Host seeks update all connected clients immediately

#### 3. Real-time Chat
- **Text messaging**: Users can send messages in real time
- **Message history**: Chat history persists and loads on room join
- **User presence**: Show who's in the room
- **Typing indicators**: Optional (nice-to-have for MVP)

#### 4. Host Moderation
- **Mute users**: Host can mute individual users from chat
- **Kick users**: Host can remove users from room
- **Ban users**: Host can ban users (prevents rejoin)
- **Slow mode**: Host can enable slow mode (rate limit messages)
- **Pin messages**: Host can pin important messages

#### 5. Grounded Discussion Features
- **Proactive prompt cards**: System suggests discussion prompts based on episode content/timestamp
- **Evidence lookup panel**: Users can search and reference external sources
- **NOT a truth oracle**: System facilitates research, doesn't claim to provide definitive answers

#### 6. Audio Sources (MVP)
- **Primary**: Podcast RSS feed import → select episode
- **Fallback**: Direct MP3 URL input
- **Explicitly excluded**: Spotify, Apple Podcasts, YouTube integration

### Technical Constraints
- **Pilot scale**: <50 users per room
- **Architecture**: Designed for future horizontal scaling
- **Tech stack**: TypeScript, Next.js, Node.js, Socket.IO, Postgres

## Non-Goals (Out of MVP Scope)

### Platform Integrations
- ❌ Spotify integration
- ❌ Apple Podcasts integration
- ❌ YouTube integration
- ❌ Other streaming platform integrations

### Advanced Features
- ❌ User authentication/accounts (invite links only)
- ❌ Room discovery/search
- ❌ Public rooms
- ❌ Video support
- ❌ Screen sharing
- ❌ Recording/saving sessions
- ❌ Mobile apps (web-only MVP)
- ❌ Allowlist/whitelist system (future enhancement)
- ❌ User profiles/avatars
- ❌ Room scheduling
- ❌ Multiple hosts/co-hosts

### Moderation
- ❌ Automated moderation/AI content filtering
- ❌ Report system
- ❌ Moderation queue
- ❌ Community guidelines enforcement

### Discussion Features
- ❌ AI-generated summaries
- ❌ Sentiment analysis
- ❌ Topic extraction
- ❌ Transcript generation

## User Stories

### As a Host
1. **US-1**: As a host, I want to create a room and get an invite link so I can share it with friends
2. **US-2**: As a host, I want to import a podcast RSS feed and select an episode so users can listen together
3. **US-3**: As a host, I want to control playback (play/pause/seek) so all users stay synchronized
4. **US-4**: As a host, I want to mute disruptive users so I can maintain discussion quality
5. **US-5**: As a host, I want to kick or ban users so I can remove problematic participants
6. **US-6**: As a host, I want to enable slow mode so I can prevent chat spam
7. **US-7**: As a host, I want to pin important messages so key information stays visible

### As a Participant
8. **US-8**: As a participant, I want to join a room via invite link so I can listen with others
9. **US-9**: As a participant, I want to see my playback sync with the host so we're all on the same page
10. **US-10**: As a participant, I want to chat with other listeners in real time so we can discuss the episode
11. **US-11**: As a participant, I want to see discussion prompts so I can engage meaningfully
12. **US-12**: As a participant, I want to use the evidence lookup panel so I can fact-check and reference sources
13. **US-13**: As a participant, I want to see who else is in the room so I know my audience

### As a System
14. **US-14**: As the system, I want to suggest discussion prompts at relevant timestamps so conversations stay grounded
15. **US-15**: As the system, I want to persist chat history so users can see past messages when joining

## Success Metrics

### Engagement Metrics
- **Average session duration**: Target >30 minutes per user per session
- **Messages per session**: Target >5 messages per user per session
- **Return rate**: Target >40% of users return within 7 days

### Technical Metrics
- **Playback sync accuracy**: <500ms drift between clients
- **Message delivery latency**: <100ms p95 for chat messages
- **Room join time**: <2 seconds from link click to active room
- **Uptime**: >99% availability during pilot

### Product Metrics
- **Room creation rate**: Track number of rooms created
- **Average room size**: Track average users per room
- **Host actions**: Track moderation actions taken
- **Prompt engagement**: Track clicks/interactions with discussion prompts

### Pilot-Specific Metrics
- **Total users**: Track unique users in pilot period
- **Total rooms**: Track total rooms created
- **Peak concurrent users**: Track maximum simultaneous users
- **Error rate**: <1% of actions result in errors

## Future Enhancements (Post-MVP)
- Allowlist/whitelist system for rooms
- User accounts and authentication
- Room discovery and search
- Mobile apps (iOS/Android)
- Advanced moderation tools
- Analytics dashboard for hosts
- Room scheduling
- Multiple hosts/co-hosts
- Recording and playback of past sessions
- Integration with Spotify/Apple Podcasts (if legally feasible)
