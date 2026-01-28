# LiveListen - Design Tokens (MVP)

This doc defines the design tokens to ensure consistent UI across the app. Tokens map cleanly to Tailwind usage while remaining framework-agnostic.

## Principles
- **Readable first**: chat + playback UI must remain legible under stress (low light, small screens).
- **Low chrome**: minimal decoration; prioritize content.
- **Predictable spacing**: consistent rhythm for lists (rooms, presence, chat).
- **Status clarity**: connection + sync states must be explicit (never color-only).

## Spacing Scale

Use an 8px base with common half-steps.

| Token | px | Typical use |
|------|----|-------------|
| `space-0` | 0 | none |
| `space-1` | 4 | tight gaps, icon padding |
| `space-2` | 8 | default gaps between inline controls |
| `space-3` | 12 | card padding (mobile compact) |
| `space-4` | 16 | card padding default |
| `space-5` | 20 | section spacing |
| `space-6` | 24 | layout spacing |
| `space-8` | 32 | large section spacing |
| `space-10` | 40 | hero spacing |
| `space-12` | 48 | page padding (desktop) |

## Type Scale

Prefer a simple scale aligned to Tailwind defaults.

| Token | Tailwind | Usage |
|------|----------|-------|
| `text-xs` | `text-xs` | metadata, timestamps |
| `text-sm` | `text-sm` | secondary text |
| `text-base` | `text-base` | default body |
| `text-lg` | `text-lg` | section headers |
| `text-xl` | `text-xl` | page titles (mobile) |
| `text-2xl` | `text-2xl` | page titles (desktop) |

### Font Weight
- **Regular**: body
- **Medium**: labels, buttons
- **Semibold**: titles

### Monospace
Use monospace for invite codes.
- Token: `font-mono`

## Radius

| Token | Tailwind | Usage |
|------|----------|-------|
| `radius-sm` | `rounded-md` | chips, small buttons |
| `radius-md` | `rounded-lg` | cards, panels |
| `radius-lg` | `rounded-xl` | modals (if used) |

## Shadows

Prefer subtle shadows; avoid heavy elevation.

| Token | Tailwind | Usage |
|------|----------|-------|
| `shadow-1` | `shadow-sm` | cards on light background |
| `shadow-2` | `shadow` | toast |
| `shadow-3` | `shadow-lg` | modal / overlay |

## Color Tokens

### Light Mode (MVP default)

| Token | Suggested | Usage |
|------|-----------|-------|
| `bg` | white | page background |
| `surface` | white/transparent | cards/panels |
| `text` | near-black | main text |
| `muted` | gray-600 | secondary text |
| `border` | black/10 | outlines |
| `primary` | blue-600 | primary buttons |
| `danger` | red-600 | destructive actions |
| `success` | green-600 | success state |
| `warning` | amber-600 | reconnecting |

### Dark Mode Decision

**Decision**: **Defer full dark mode** for MVP.\n\nReasoning:\n- MVP priority is functional multi-user experience.\n- A partial dark mode often harms contrast and increases QA scope.\n\n**MVP compromise**:\n- Support system-level backgrounds lightly (no hard assumptions).\n- Ensure sufficient contrast in light mode.\n- Plan dark mode as post-pilot enhancement.

## Motion

### Reduced Motion
- If `prefers-reduced-motion` is set, disable non-essential transitions.
- Chat should not animate-scroll; jump to bottom.

### Default Motion
- Button hover: 150ms
- Toast in/out: 150–200ms (optional)

## Layout Tokens

### Container Widths
- `max-w-md`: onboarding, forms
- `max-w-3xl`: room layout (mobile stacked)
- `max-w-6xl`: room layout (desktop split)

### Breakpoints
- Mobile-first; optimize for 360–430px widths.
- Desktop layout begins at `md` (≥768px).

## Environment Banner / Ribbon

### Purpose
Prevent confusion between **staging** and **production** (and keep local obvious for debugging).

### Behavior
- **Local**: show subtle “LOCAL” badge in header (optional).
- **Staging**: show **persistent staging ribbon** at top of the page.
- **Production**: show nothing.

### Visual Spec
- Height: 28–32px
- Background: amber-100 (light) / amber-900 (future dark)
- Text: “STAGING” + optional build info (commit short SHA if available)
- Placement: fixed at top, above header; pushes content down (avoid overlay).

### Accessibility
- Must include text label (not color-only).
- Should be dismissible only in local dev; not dismissible in staging.

## Component-Specific Tokens

### Chat Bubble
- Padding: `space-3` (12px)
- Max width: 85% (mobile), 70% (desktop)
- System message: full width, muted background

### Playback Bar
- Height: 56–72px
- Controls: minimum 44px touch target

### Presence List
- Row height: 40–44px
- Host pinned and labeled

