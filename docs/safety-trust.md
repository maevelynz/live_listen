# LiveListen - Safety, Trust & Moderation

## Threat Model

LiveListen's invite-only, real-name model creates a unique safety profile. This document outlines threats, MVP guardrails, and future enhancements.

### Primary Threats

#### 1. Harassment & Bullying
**Risk**: High - Real names increase accountability but also enable targeted harassment.

**Attack Vectors**:
- Repeated unwanted messages to specific users
- Hostile language or personal attacks
- Coordinated harassment from multiple accounts
- Persistent re-joining after being kicked/banned

**Impact**: Users feel unsafe, leave rooms, negative word-of-mouth.

#### 2. Doxxing & Privacy Violations
**Risk**: Medium-High - Real names are required, increasing doxxing risk.

**Attack Vectors**:
- Sharing personal information (address, phone, email) in chat
- Linking real names to social media profiles
- Collecting names for external harassment
- Screenshot sharing of private conversations

**Impact**: Real-world harm, legal liability, user trust erosion.

#### 3. Impersonation
**Risk**: Medium - No authentication system in MVP makes impersonation easier.

**Attack Vectors**:
- Creating rooms with fake host names
- Joining rooms with similar names to trusted users
- Claiming to be someone else to gain trust

**Impact**: Trust breakdown, confusion, potential fraud.

#### 4. Spam & Disruption
**Risk**: Medium - Chat is central to the experience.

**Attack Vectors**:
- Rapid-fire messages flooding chat
- Repeated identical messages
- Off-topic spam (ads, links)
- Automated bot messages

**Impact**: Degraded user experience, chat becomes unusable.

#### 5. Misinformation & False Claims
**Risk**: Medium - Discussion-focused platform amplifies claims.

**Attack Vectors**:
- Making unsubstantiated factual claims
- Sharing false information as fact
- Linking to unreliable sources
- Coordinated misinformation campaigns

**Impact**: Users misled, platform credibility damaged, potential legal issues.

#### 6. Content Policy Violations
**Risk**: Low-Medium - Depends on content policies.

**Attack Vectors**:
- Hate speech, discriminatory language
- Illegal content sharing
- Copyright violations (sharing full episodes)
- NSFW content in chat

**Impact**: Platform liability, user discomfort, legal issues.

## MVP Guardrails

### 1. Invite-Only Rooms
**Implementation**: Rooms require cryptographically random invite codes.

**Protection**:
- Prevents public harassment
- Limits room discovery to trusted networks
- Reduces spam/bot access

**Limitations**:
- Invite codes can be shared publicly (Twitter, Reddit)
- No way to revoke invite codes
- Host must manually manage access

**Future Enhancements**:
- Time-limited invite codes
- Revocable invite links
- Allowlist/whitelist system
- Room visibility controls (private/public/unlisted)

### 2. Host Powers

#### Mute User
**Function**: Host can mute individual users, preventing them from sending messages.

**Implementation**:
- Socket.IO event: `moderation:mute`
- Database: `room_members.is_muted` flag
- Persists across sessions

**Limitations**:
- User can still see messages
- User remains in room (can unmute if host changes mind)
- No automatic unmute timer

#### Kick User
**Function**: Host can remove user from room immediately.

**Implementation**:
- Socket.IO event: `moderation:kick`
- Disconnects user from room namespace
- User can rejoin if they have invite code

**Limitations**:
- User can rejoin immediately with same invite
- No cooldown period
- No automatic ban

#### Ban User
**Function**: Host can ban user, preventing rejoin.

**Implementation**:
- Socket.IO event: `moderation:ban`
- Database: `bans` table with `room_id`, `user_id`, `reason`, `banned_by`
- Check on room join: if banned, reject with `USER_BANNED` error

**Limitations**:
- Ban is room-specific (user can join other rooms)
- No global ban system
- No ban expiration

#### Lock Room
**Function**: Host can lock room, preventing new joins.

**Implementation**:
- Room setting: `is_locked` boolean
- Check on `POST /rooms/join`: if locked, reject with `ROOM_LOCKED` error
- Host can unlock at any time

**Limitations**:
- Lock is manual (no auto-lock at capacity)
- No time-based locking

**Future Enhancements**:
- Auto-lock at capacity (50 users)
- Temporary locks (e.g., 5 minutes)
- Co-host permissions
- Moderation queue for reported content

### 3. Report Flow

#### Client-Side
**UI**: Report button on messages, users, or room.

**Report Types**:
- `harassment` - Harassment or bullying
- `spam` - Spam or disruptive content
- `misinformation` - False or misleading information
- `doxxing` - Sharing personal information
- `impersonation` - Impersonating another user
- `inappropriate_content` - Content policy violations
- `other` - Other issues

**Report Payload**:
```typescript
{
  reportType: string,
  targetType: 'message' | 'user' | 'room',
  targetId: string,
  roomId: string,
  reason: string,
  reporterUserId: string
}
```

#### Server-Side
**Endpoint**: `POST /reports`

**Request**:
```typescript
{
  reportType: 'harassment' | 'spam' | 'misinformation' | 'doxxing' | 'impersonation' | 'inappropriate_content' | 'other',
  targetType: 'message' | 'user' | 'room',
  targetId: string, // UUID
  roomId: string, // UUID
  reason: string // Optional, max 500 chars
}
```

**Response**:
```typescript
{
  report: {
    id: string, // UUID
    reportType: string,
    targetType: string,
    targetId: string,
    roomId: string,
    reporterUserId: string,
    reason: string | null,
    status: 'pending',
    createdAt: string // ISO timestamp
  }
}
```

**Processing**:
1. Validate report payload (Zod schema)
2. Authenticate user (JWT token required)
3. Store in `reports` table
4. Log event: `report_submitted` to `audit_events`
5. If severity is high (harassment, doxxing), notify host immediately (future: socket event)
6. Return acknowledgment

**Storage**:
- `reports` table:
  ```sql
  CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(20) NOT NULL, -- 'message' | 'user' | 'room'
    target_id UUID NOT NULL,
    room_id UUID REFERENCES rooms(id),
    reporter_user_id UUID REFERENCES users(id),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'reviewed' | 'resolved' | 'dismissed'
    created_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE INDEX idx_reports_room_id ON reports(room_id);
  CREATE INDEX idx_reports_reporter_user_id ON reports(reporter_user_id);
  CREATE INDEX idx_reports_status ON reports(status);
  CREATE INDEX idx_reports_created_at ON reports(created_at);
  ```
- Status: `pending`, `reviewed`, `resolved`, `dismissed`

**MVP Limitations**:
- No automated review system
- No moderation queue UI
- Reports stored but not automatically acted upon
- Manual review required (future)

**Future Enhancements**:
- Automated triage (high-severity reports flagged)
- Moderation dashboard for hosts
- Escalation to platform moderators
- Automated actions (auto-mute on multiple reports)

### 4. Message Rate Limiting

#### Per-User Rate Limits
**Implementation**:
- Track last message timestamp per user per room
- Enforce minimum delay between messages
- Default: 1 message per 2 seconds (configurable per room)

**Slow Mode**:
- Host can enable slow mode: 1 message per N seconds (default 5)
- Applied to all non-host users
- Host messages not rate-limited

**Anti-Spam Heuristics**:
1. **Duplicate Detection**: Reject identical messages within 30 seconds
2. **Rapid Fire**: If >10 messages in 60 seconds, increase delay to 10 seconds
3. **Link Spam**: Flag messages with >3 URLs for review
4. **Character Patterns**: Flag excessive caps, repeated characters (e.g., "AAAAA")

**Implementation Details**:
```typescript
// Rate limit check
const lastMessageTime = getUserLastMessageTime(userId, roomId)
const minDelay = room.slowMode ? room.slowModeDelay * 1000 : 2000
if (Date.now() - lastMessageTime < minDelay) {
  return { error: 'RATE_LIMITED', retryAfter: minDelay }
}

// Duplicate check
const recentMessages = getRecentMessages(userId, roomId, 30000)
if (recentMessages.some(m => m.content === messageContent)) {
  return { error: 'DUPLICATE_MESSAGE' }
}
```

**Limitations**:
- Rate limits are per-room (user can spam other rooms)
- No global rate limiting
- Heuristics are basic (no ML/AI)

**Future Enhancements**:
- Machine learning spam detection
- Adaptive rate limiting (increase delay for repeat offenders)
- Global user reputation score
- IP-based rate limiting

### 5. Content Filtering (Future)

**MVP**: No automated content filtering.

**Future**:
- Keyword filtering (configurable by host)
- Profanity filter (optional)
- Link scanning (check for malicious URLs)
- Image content moderation (if images added)

## Logging & Instrumentation

### Event Taxonomy

All safety-critical events should be logged for audit trails and analytics.

#### Event Types

1. **`room_created`**
   - Fields: `room_id`, `host_user_id`, `invite_code`, `timestamp`
   - Purpose: Track room creation patterns, identify spam rooms

2. **`user_joined`**
   - Fields: `room_id`, `user_id`, `timestamp`
   - Purpose: Track user activity, identify suspicious join patterns

3. **`user_left`**
   - Fields: `room_id`, `user_id`, `timestamp`, `reason` (normal/kicked/banned)
   - Purpose: Understand user retention, track moderation actions

4. **`message_sent`**
   - Fields: `room_id`, `user_id`, `message_id`, `message_length`, `contains_links`, `timestamp`
   - Purpose: Track chat activity, identify spam patterns

5. **`report_submitted`**
   - Fields: `report_id`, `report_type`, `target_type`, `target_id`, `reporter_user_id`, `room_id`, `timestamp`
   - Purpose: Track safety incidents, identify patterns

6. **`user_kicked`**
   - Fields: `room_id`, `user_id`, `kicked_by_user_id`, `timestamp`
   - Purpose: Track moderation actions, identify problematic users

7. **`user_banned`**
   - Fields: `room_id`, `user_id`, `banned_by_user_id`, `reason`, `timestamp`
   - Purpose: Track bans, identify repeat offenders

8. **`user_muted`**
   - Fields: `room_id`, `user_id`, `muted_by_user_id`, `muted` (boolean), `timestamp`
   - Purpose: Track moderation actions

9. **`room_locked`**
   - Fields: `room_id`, `locked_by_user_id`, `locked` (boolean), `timestamp`
   - Purpose: Track room access controls

10. **`rate_limit_triggered`**
    - Fields: `room_id`, `user_id`, `limit_type`, `timestamp`
    - Purpose: Identify spam attempts, tune rate limits

### Storage Strategy

#### Option 1: Database Table (Recommended for MVP)
**Table**: `audit_events`
```sql
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  room_id UUID REFERENCES rooms(id),
  user_id UUID REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_events_event_type ON audit_events(event_type);
CREATE INDEX idx_audit_events_room_id ON audit_events(room_id);
CREATE INDEX idx_audit_events_user_id ON audit_events(user_id);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at);
```

**Pros**:
- Queryable, searchable
- Can join with other tables
- Easy to implement

**Cons**:
- Database load increases
- Storage costs grow over time
- May need archival strategy

#### Option 2: Log Sink (Future)
**Implementation**: Structured logging to external service (e.g., Datadog, Splunk, CloudWatch).

**Pros**:
- Scalable, doesn't impact database
- Better for high-volume events
- Built-in retention policies

**Cons**:
- Additional infrastructure cost
- Less queryable than database
- Requires external service setup

#### MVP Recommendation
Use **Option 1 (Database Table)** for MVP:
- Simple to implement
- Queryable for basic analytics
- Can migrate to log sink later if needed
- Retention: Keep events for 90 days, then archive

### Logging Implementation

**Note**: This should be implemented by Agent 2 when adding event logging infrastructure.

```typescript
// lib/audit.ts (to be created)
export async function logEvent(
  eventType: string,
  data: {
    roomId?: string
    userId?: string
    targetUserId?: string
    metadata?: Record<string, any>
  }
) {
  await db.query(
    `INSERT INTO audit_events (event_type, room_id, user_id, target_user_id, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [eventType, data.roomId, data.userId, data.targetUserId, JSON.stringify(data.metadata || {})]
  )
}

// Usage example
await logEvent('user_kicked', {
  roomId: room.id,
  userId: targetUser.id,
  targetUserId: host.id,
  metadata: { reason: 'spam' }
})

await logEvent('report_submitted', {
  roomId: report.roomId,
  userId: report.reporterUserId,
  metadata: { 
    reportType: report.reportType,
    targetType: report.targetType,
    targetId: report.targetId
  }
})
```

## Fact-Check Assistant (MVP Concept)

### Philosophy
LiveListen is **NOT a truth oracle**. The fact-check assistant facilitates research and critical thinking, not definitive answers.

### When to Intervene

#### High-Risk Claims (Intervene)
- Health/medical claims (e.g., "vaccines cause X")
- Financial advice (e.g., "invest in X crypto")
- Legal claims (e.g., "X is illegal")
- Safety claims (e.g., "X is safe to consume")

#### Medium-Risk Claims (Flag, Don't Block)
- Political claims
- Historical claims
- Scientific claims (non-medical)

#### Low-Risk Claims (No Intervention)
- Opinions
- Personal experiences
- Subjective statements

### Presentation Strategy

#### "Uncertain" Badge
When a high-risk claim is detected:
1. Show a subtle badge next to the message: "⚠️ Needs source"
2. On click, show: "This claim may need verification. Consider checking reliable sources."
3. Provide link to evidence lookup panel

#### "Needs Source" Prompt
For medium-risk claims:
1. Show info icon: "ℹ️"
2. On click: "This statement could benefit from sources. Use the evidence lookup panel to find references."

#### User Controls
- **Toggle**: Users can disable fact-check badges (settings)
- **Transparency**: Always show why a badge appeared (on hover/click)
- **No Blocking**: Never automatically delete or hide messages
- **Host Override**: Host can dismiss badges if they verify the claim

### Implementation (Future)

```typescript
// Concept: Fact-check service
async function checkClaim(message: string): Promise<{
  riskLevel: 'high' | 'medium' | 'low'
  claimType?: string
  suggestedSources?: string[]
}> {
  // Use NLP/ML to detect factual claims
  // Check against known fact-check databases
  // Return risk assessment
}

// In message handler
const factCheck = await checkClaim(message.content)
if (factCheck.riskLevel === 'high') {
  // Add badge to message
  message.factCheckBadge = 'needs_source'
}
```

### MVP Status
**Not implemented in MVP** - Documented for future consideration.

## Privacy

### Chat Log Retention

#### MVP Policy
- **Active Rooms**: Messages stored indefinitely (for room history)
- **Inactive Rooms**: After 30 days of inactivity, archive messages (move to cold storage)
- **Deleted Rooms**: Delete messages after 7 days (soft delete, then hard delete)

#### User Rights
- Users cannot delete their own messages (MVP limitation)
- Host can delete room (deletes all messages)
- Future: User message deletion, data export

### PII Handling

#### Real Names
- **Storage**: Real names stored in `users` table
- **Display**: Real names visible to all room participants
- **Export**: Real names included in data exports (if implemented)
- **Deletion**: On user deletion request, anonymize names in historical messages

#### Session Data
- **Storage**: Session IDs stored temporarily (for Socket.IO)
- **Retention**: Session data deleted after 24 hours of inactivity
- **No Tracking**: No cross-site tracking, no third-party analytics (MVP)

### GDPR/CCPA Compliance (Future)

#### Required for Public Launch
1. **Privacy Policy**: Clear explanation of data collection and use
2. **Data Export**: Users can export their data (messages, rooms)
3. **Data Deletion**: Users can request deletion of their data
4. **Consent**: Explicit consent for data processing (if required)
5. **Right to Access**: Users can request their data
6. **Right to Rectification**: Users can correct their data
7. **Data Portability**: Users can transfer their data

#### MVP Status
**Not required for MVP** - Invite-only pilot doesn't require full GDPR compliance, but should be prepared for public launch.

#### Implementation Checklist (Pre-Public Launch)
- [ ] Privacy policy page
- [ ] Data export endpoint (`GET /users/:id/export`)
- [ ] Data deletion endpoint (`DELETE /users/:id`)
- [ ] Consent flow (if required)
- [ ] Data retention policy enforcement
- [ ] Anonymization tools for deleted users

### Data Minimization

#### MVP Approach
- Collect only necessary data: name, room participation, messages
- No email addresses (MVP)
- No phone numbers
- No location data
- No device fingerprints

#### Future Considerations
- If authentication added, collect email (with consent)
- If analytics added, collect usage data (anonymized)
- Always minimize data collection to what's necessary

## Moderation Workflow

### Host Workflow

1. **Observe Issue**: Host sees problematic behavior
2. **Take Action**: Mute, kick, or ban user
3. **Log Event**: Action logged to audit_events
4. **Notify Users**: Broadcast moderation event to room

### Report Workflow (Future)

1. **User Reports**: User submits report via UI
2. **Store Report**: Report saved to `reports` table
3. **Notify Host**: Host receives notification (if high severity)
4. **Host Reviews**: Host reviews report and takes action
5. **Update Status**: Report status updated to `reviewed` or `resolved`

### Escalation (Future)

1. **Multiple Reports**: If user receives >3 reports across rooms, flag for review
2. **Platform Moderators**: Escalate to platform moderators (if available)
3. **Global Actions**: Consider global ban for repeat offenders

## Metrics & Monitoring

### Safety Metrics to Track

1. **Report Rate**: Reports per 1000 messages
2. **Moderation Actions**: Kicks, bans, mutes per room
3. **User Retention**: Users leaving rooms (normal vs. kicked)
4. **Spam Detection**: Rate limit triggers per room
5. **Fact-Check Badges**: High-risk claims flagged (if implemented)

### Alerting (Future)

- **High Report Rate**: Alert if room has >5 reports in 1 hour
- **Spam Surge**: Alert if >10 rate limit triggers in 5 minutes
- **Ban Patterns**: Alert if user banned from >3 rooms

## Future Enhancements

### Short-Term (Post-MVP)
- Moderation dashboard for hosts
- Report review queue
- Keyword filtering
- Link scanning

### Medium-Term
- Machine learning spam detection
- Automated fact-checking integration
- User reputation scores
- Global ban system

### Long-Term
- Platform moderators
- Community guidelines enforcement
- Appeal process for bans
- Transparency reports

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Moderation Best Practices](https://www.w3.org/TR/content-moderation/)
- [GDPR Compliance Guide](https://gdpr.eu/)
- [CCPA Compliance Guide](https://oag.ca.gov/privacy/ccpa)
