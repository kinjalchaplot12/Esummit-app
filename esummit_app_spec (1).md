# E-Summit Mobile App — Specification & Database Reference
### React Native (iOS + Android) · Server-Driven UI · Shared E-Cell Backend

**Prepared for:** E-Cell MNIT Jaipur team, E-Summit site developer, app developer
**Date:** October 2026
**Status:** Planning document. Nothing in the app is built yet.

**Companion documents**
- `BACKEND_HANDOVER.md` — the real, current state of the E-Cell site (schema, auth, AWS, API routes). Everything marked **EXISTING** below comes from it.
- `esummit_system_spec.md` — the planned E-Summit website systems (CA program, ticketing, accommodation, ID, QR, Razorpay). Everything marked **PLANNED** comes from it.
- This document adds what the **app** needs. Everything marked **NEW-APP** is introduced here.

---

## 0. How to Read This Document

| Part | Sections | Audience |
|---|---|---|
| A. The app | 1–7 | Everyone: product scope, screens, SDUI, auth, features |
| B. Backend & data | 8–10 | E-Summit site developer, app developer: API list, full database schema, infrastructure |
| C. Delivery | 11–14 | Team: security, build phases, admin panel additions, open questions |

**Status tags used throughout**
- **EXISTING** — in the production E-Cell database/code today (per `BACKEND_HANDOVER.md`).
- **PLANNED** — designed in `esummit_system_spec.md`, not built yet.
- **NEW-APP** — new for the mobile app, defined in this document.

---

# PART A — THE APP

## 1. Overview

### 1.1 What the app is
The official E-Summit app for attendees, Campus Ambassadors, and event staff. It is a **companion app**, not a second store. People use it to find their way around campus, register for events, show their entry QR, get live updates, and edit their profile. Volunteers and E-Cell members use the same app to scan QR codes at the gate and kit desk.

### 1.2 What the app does NOT do
- **No ticket purchase and no accommodation booking in the app.** Both happen on the E-Summit website. The app only shows status and sends the user to the site (see §5.6, secure web handoff).
- **No payments of any kind** inside the app. No Razorpay SDK in the app.
- **No in-app chat, feed, or social features.**
- No ID document upload or viewing in v1 (web only).

### 1.3 Confirmed decisions
| Decision | Detail |
|---|---|
| Framework | **React Native**. |
| Platforms | **Android and iOS** from the start. |
| UI approach | **Server-Driven UI (SDUI)** for content screens (see §3). |
| Backend | **Same backend, database, and accounts** as the E-Cell and E-Summit sites. One account everywhere. |
| Tickets and accommodation | Bought on the E-Summit site only. App redirects there. |
| Campus locations | Shown in the app; "Directions" opens **Google Maps**. |
| Event registration | Done inside the app. |
| Profile | Viewable and editable inside the app. |
| Volunteers | **Same app.** They get an **extra Scan page**, visible **only** to accounts that carry a **Volunteer** or **Member** tag in the database. |
| Features chosen | Everything in §2 (the full suggestion list minus the removals below). |

### 1.4 Explicitly removed from scope (decided)
1. Event schedule / **"My Schedule"**: starring events, personal day timeline, clash alerts.
2. Event **feedback and ratings**.
3. **Lost and found** / "report a problem" form.
4. **Photo gallery** inside the app.
5. **Networking, check-in-points leaderboard, gamification.**

### 1.5 Interpretations to confirm
These follow from the removals above. Please confirm they are right.
- **The Events list stays.** Registration is a confirmed feature, so users still browse events (by day or category) and register. Only the personal "My Schedule" layer is removed.
- **Event reminder pushes stay**, but only for events the user registered for. Clash alerts are removed.
- **The CA leaderboard rank stays** on the CA card, because it belongs to the CA program in the system spec. The removed "leaderboard" is the points-for-check-ins gamification idea.
- **"Add to calendar"** on an event page stays (it was not in the removed list).

---

## 2. Feature List

### 2.1 Everyone (attendees)

| # | Feature | What it does | Built as |
|---|---|---|---|
| 1 | **Guest browsing** | Home, Events, Map, FAQ, Speakers, Sponsors, Help work without login. Login is needed only for registration, pass, and profile. (Apple review expects this; see §11.) | Native shell + SDUI |
| 2 | **Account login/signup** | Email + password, Google, and Sign in with Apple (see §5 and open question Q1). Same account as the websites. | Native |
| 3 | **Home** | Countdown, pinned announcement banner, "Happening now / next" events, quick actions, featured speakers, sponsors, Buy Ticket call-to-action when the user has no ticket. | **SDUI** |
| 4 | **Events list and detail** | Browse by day/category, see description, venue, speakers, capacity state. **Register / Cancel registration** using the existing rules (§7.3). **Get directions** and **Add to calendar** on each event. | SDUI layout + native register action |
| 5 | **My Pass (ticket status + QR)** | Shows the one active ticket, its **Ticket QR**, the **Group QR** (if in a group), accommodation status, and a **Buy / Upgrade / Upload ID** button that opens the website. **Works offline** from cache. | Native (QR must be reliable) |
| 6 | **Campus map with categories** | List of campus places by category (hostels, venues, food, parking, help desk, medical, washrooms, ATMs, gates), search, distance from the user if location is allowed, **Open in Google Maps** per place. | SDUI list + native location |
| 7 | **Live Updates** | Feed of day-of changes from admin. Pinned banner on Home. | SDUI |
| 8 | **FAQ** | Accordion list; same content as the web FAQ. | SDUI |
| 9 | **Speakers and guests** | List and detail pages; linked from events. | SDUI |
| 10 | **Sponsors** | Grid by tier; tap opens the sponsor site. | SDUI |
| 11 | **Help and contact** | Helpdesk, security, medical, transport. **One-tap call or WhatsApp.** | SDUI |
| 12 | **Emergency and safety card** | Campus security number, medical room (with directions), and the user's own emergency contact (read-only, from their ticket). | Native card + SDUI contacts |
| 13 | **Push notifications** | Event reminders, announcements, live updates, ticket updates. Per-category on/off. | Native |
| 14 | **Offline cache** | Layouts, events, locations, FAQ, contacts, speakers, and the user's pass are cached so the app opens with no signal. | Native |
| 15 | **Deep links** | Links from email/WhatsApp/web open the right screen in the app (§7.9). | Native |
| 16 | **Profile** | View/edit name, gender, phone, college/institution, photo, notification and promotional-email preferences. Log out. Log out everywhere. Delete account. | Native |
| 17 | **Announcement banners** | Admin can pin a banner to Home with an optional link. | SDUI |

### 2.2 Campus Ambassadors
| Feature | What it does |
|---|---|
| **CA card** | Shown only to approved CAs. Referral code, share button (native share sheet with referral link), attributed tickets count, **leaderboard rank**, promo poster download. "Apply to become a CA" opens the website when `caApplicationsOpen` is true and the user is not a CA. |

### 2.3 Volunteers and Members (role-gated)
| Feature | What it does |
|---|---|
| **Scan tab** | Visible **only** to accounts with a Volunteer or Member tag (§6). Three modes: **Attendance**, **Kit collection**, **Event check-in**. |
| Offline-tolerant scanning | Scans queue on the device and sync when online (§7.7). |
| Result screens | Large, clear green/red/amber result with attendee name, group, and reason. Haptic and sound feedback. |
| Session summary | Count of scans this shift, pending sync count, conflicts. |

### 2.4 Editors and Admins
| Feature | What it does |
|---|---|
| **Draft layout preview** | A hidden switch in Settings, visible only to Editor/Admin roles, makes the app fetch **draft** SDUI layouts so changes can be previewed before publishing (§4.9). |

---

## 3. Navigation and Screens

### 3.1 Bottom tabs (fixed, native)
`Home` · `Events` · `Map` · `My Pass` · `More`
plus **`Scan`** as a sixth tab, shown only for Volunteer/Member (§6).

The tab bar itself is native and fixed so it can never be broken by a bad layout. Tab *content* is SDUI where marked.

### 3.2 Screen inventory

| Screen | Type | Auth | Notes |
|---|---|---|---|
| Splash / forced-update / maintenance | Native | none | Reads `AppConfig` (§9.4). |
| Welcome / Login / Signup / Forgot password | Native | none | Verify-email and reset-password links open the **web** page. |
| Pending email verification | Native | restricted | "Resend email", "I've verified" refresh. |
| Onboarding | Native | verified | Same fields as web onboarding (follows §9.6 schema). |
| **Home** | **SDUI** | optional | |
| **Events list** | SDUI header + native list | optional | Day and category filters. |
| **Event detail** | SDUI | optional | Register button is a native action. |
| **Map (Campus places)** | SDUI + native | optional | Location permission is foreground-only. |
| **My Pass** | Native | required | QR screen cached for offline. |
| **More** | SDUI | optional | Menu of links. |
| Live Updates | SDUI | optional | |
| FAQ | SDUI | optional | |
| Speakers list / detail | SDUI | optional | |
| Sponsors | SDUI | optional | |
| Help and Emergency | SDUI + native card | optional | |
| CA card | Native | CA only | |
| Profile and Settings | Native | required | Includes delete account. |
| **Scan** (mode picker, camera, result, sync status) | Native | Volunteer/Member | Server-enforced. |

### 3.3 Design direction
Dark theme using the E-Summit brand (logo already provided). Final colors and type come from the E-Summit UI prompts that will be written separately. The same "not AI-generated looking" rules apply: real hierarchy, no emoji, Lucide-style line icons, no generic pill badges. The app and website should clearly feel like one brand.

---

## 4. Server-Driven UI (SDUI)

### 4.1 Why SDUI here
Admins can change Home, event pages, FAQ, banners, and the More menu **without shipping a new app version**. This matters because app store review takes days and a typo on event day must be fixable in minutes.

### 4.2 What is SDUI and what stays native
| SDUI (server decides layout) | Native (app decides, server only supplies data) |
|---|---|
| Home, More menu, FAQ, Live Updates, Speakers, Sponsors, Help, Event detail layout, Map screen header | **Login/signup, onboarding, My Pass and QR, profile editing, Scan tab, push permission prompts, location permission, tab bar** |

Reason: anything involving security, offline use, the camera, or permissions must be written and tested natively. A broken layout must never be able to lock someone out of their QR.

### 4.3 Response envelope
Every SDUI screen is a JSON document returned by `GET /api/app/v1/screens/{key}`.

```
{
  "schemaVersion": 1,            // SDUI format version the server speaks
  "key": "HOME",
  "version": 17,                 // published version number
  "title": "E-Summit",
  "ttlSeconds": 300,             // how long the app may use it without refetching
  "sections": [ { component }, { component }, ... ]
}
```

Each **component**:
```
{
  "id": "hero-1",                      // stable id
  "type": "HeroBanner",                // must exist in the app's registry
  "minAppVersion": "1.0.0",            // optional
  "visibleIf": { ... },                // optional rule, see 4.6
  "props": { ... },                    // type-specific
  "action": { ... },                   // optional tap action, see 4.5
  "fallback": { component }            // optional, used if type unknown
}
```

### 4.4 Component catalog (v1)
| Type | Purpose | Data |
|---|---|---|
| `HeroBanner` | Big image/title/subtitle with optional CTA | static props |
| `Countdown` | Countdown to a datetime | static |
| `AnnouncementBanner` | Pinned notice | reads active `LiveUpdate` or static text |
| `SectionHeader` | Title with optional "See all" link | static |
| `QuickActionGrid` | 2–4 icon tiles (Map, Events, FAQ, Help) | static, each with action |
| `EventList` | List/carousel of events | **bound to events API** (filters: day, category, `happeningNow`, `upcoming`, ids) |
| `EventCard` | Single event highlight | by event id |
| `SpeakerCarousel` | Speakers row | bound to speakers API |
| `SponsorGrid` | Logos by tier | bound to sponsors API |
| `FAQAccordion` | Questions and answers | bound to `FAQItem` |
| `LiveUpdateList` | Feed of updates | bound to `LiveUpdate` |
| `LocationCategoryList` | Campus places by category | bound to `CampusLocation` |
| `ContactList` | Help contacts with call/WhatsApp buttons | bound to `HelpContact` |
| `LinkList` | Menu rows (More screen) | static, each with action |
| `RichText` | Short formatted text (bold, links, lists only) | static |
| `ImageBlock` | Single image with optional action | static |
| `ButtonRow` | One or two buttons | static |
| `InfoCard` | Icon + title + body (e.g. "Food is not provided") | static |
| `TicketCTA` | "Get your ticket" card | native-rendered; server supplies copy only |
| `CACard` | CA referral summary | native-rendered; server supplies copy only |
| `Spacer`, `Divider` | Layout | static |

Rules:
- **Unknown component types are skipped silently** (or replaced by `fallback`). The app must never crash on an unknown type.
- Components never contain executable code, scripts, or HTML.
- Bound components fetch data through typed APIs, so layouts stay small and data stays fresh.

### 4.5 Action catalog (the only things a tap can do)
| Action | Example | Notes |
|---|---|---|
| `navigate` | `{ "type": "navigate", "screen": "EVENT_DETAIL", "params": { "slug": "..." } }` | Screen must exist in the app's route table. |
| `openUrl` | `{ "type": "openUrl", "url": "https://esummit.ecellmnit.org/tickets", "handoff": true }` | `handoff: true` uses the secure web handoff (§5.6). URL host must be on the **allowlist** (§4.8). |
| `openMaps` | `{ "type": "openMaps", "lat": 26.86, "lng": 75.81, "label": "Main Auditorium" }` | Opens Google Maps directions. |
| `call` | `{ "type": "call", "number": "+91..." }` | |
| `whatsapp` | `{ "type": "whatsapp", "number": "+91...", "text": "..." }` | Uses `wa.me`. |
| `share` | `{ "type": "share", "text": "...", "url": "..." }` | Native share sheet. |
| `addToCalendar` | `{ "type": "addToCalendar", "eventId": "..." }` | |
| `registerEvent` | `{ "type": "registerEvent", "eventId": "..." }` | Native confirmation, then the API. |
| `copy` | `{ "type": "copy", "text": "..." }` | |

Unknown actions are **ignored and the control is hidden or disabled**. Nothing else can be triggered from the server.

### 4.6 Visibility rules (`visibleIf`)
Evaluated on the device from the user's state, so public layouts can be cached for everyone.
```
{ "auth": "loggedIn" | "loggedOut",
  "hasTicket": true | false,
  "ticketStatus": "NONE" | "PAID" | "ID_PENDING" ...,
  "isCA": true | false,
  "roles": ["VOLUNTEER", "MEMBER"],
  "platform": "ios" | "android" }
```
**Important:** `visibleIf` is only cosmetic. Security (for example the Scan tab) is always enforced on the server, never by hiding a component.

### 4.7 Caching and offline
- Public screens are **identical for all users** and sent with `ETag` and `Cache-Control: s-maxage` so CloudFront/Vercel can serve them. This protects the database when everyone opens the app at once on event day.
- Personal data (ticket, registrations, profile) comes from separate authenticated endpoints, never inside a layout.
- The app stores the **last good layout** for every screen and shows it instantly (stale-while-revalidate).
- A **bundled fallback layout** for Home, More, and Help ships inside the app binary for the very first launch with no network.
- If a layout fails validation or rendering, the app falls back to its last good layout.

### 4.8 Security rules for SDUI
- `openUrl` is restricted to an **allowlist**: `*.ecellmnit.org`, `ecellmnit.org`, `maps.google.com`, `google.com/maps`, `wa.me`, `tel:`, `mailto:`, plus sponsor domains explicitly stored on `Sponsor.websiteUrl`. Anything else is blocked. This stops a compromised admin account from phishing every user.
- `handoff: true` is only honoured for `esummit.ecellmnit.org` paths on a short allowlist (§5.6).
- Layouts are **validated against a JSON schema on the server before publish** (component types, prop shapes, action shapes, size limit).
- Publishing needs **EDITOR/ADMIN** and is written to `AuditLog`.
- Apple and Google allow SDUI when the app only interprets data using components that already ship in the binary. Do **not** send code or scripts.

### 4.9 Authoring and publishing
- Admin edits layouts in the **E-Summit admin panel** using forms (add section, reorder, edit text/image/action), not raw JSON.
- Every screen has a **draft** and a **published** copy. **Publish** bumps `version`, and **Rollback** republishes an older version. History is kept (`AppScreenVersion`).
- **Draft preview:** Editors/Admins turn on "Preview drafts" in the app (§2.4); the app then sends `?draft=1` and the server only honours it for those roles.
- The server also filters components by the requesting app's version (`X-App-Version`, `X-Platform` headers), so an old app never receives a component it cannot render.

### 4.10 Example (Home, shortened)
```
{
  "schemaVersion": 1, "key": "HOME", "version": 17, "ttlSeconds": 300,
  "sections": [
    { "id": "banner", "type": "AnnouncementBanner", "props": { "source": "liveUpdates", "limit": 1 } },
    { "id": "hero", "type": "HeroBanner",
      "props": { "title": "E-Summit", "subtitle": "MNIT Jaipur", "imageUrl": "https://<cloudfront>/app-banners/xxxx.webp" } },
    { "id": "buy", "type": "TicketCTA", "visibleIf": { "hasTicket": false },
      "props": { "title": "Get your ticket", "body": "MNIT students attend free." },
      "action": { "type": "openUrl", "url": "https://esummit.ecellmnit.org/tickets", "handoff": true } },
    { "id": "now", "type": "EventList", "props": { "filter": "happeningNow", "limit": 5 } },
    { "id": "quick", "type": "QuickActionGrid",
      "props": { "items": [
        { "icon": "map-pin", "label": "Campus map", "action": { "type": "navigate", "screen": "MAP" } },
        { "icon": "help-circle", "label": "FAQ", "action": { "type": "navigate", "screen": "FAQ" } } ] } },
    { "id": "speakers", "type": "SpeakerCarousel", "props": { "featuredOnly": true } },
    { "id": "sponsors", "type": "SponsorGrid", "props": {} }
  ]
}
```

---

## 5. Authentication for the Mobile App

### 5.1 The problem
The websites use NextAuth **cookie sessions** (database strategy, shared across `.ecellmnit.org`). A native app has no browser cookie jar, so it cannot use that mechanism directly. The app needs its own token-based login that still uses the **same users and the same rules**.

### 5.2 Design: opaque bearer tokens in a new `MobileSession` table
- On successful login, the server creates a `MobileSession` row and returns a **random 256-bit token**. Only its **SHA-256 hash** is stored (tokens are high-entropy, so a fast hash is fine and gives an indexed O(1) lookup; this avoids the bcrypt-scanning weakness noted in `BACKEND_HANDOVER.md` §11).
- The app stores the token in **Keychain (iOS) / Keystore (Android)** via secure storage, and sends `Authorization: Bearer <token>`.
- Lifetime: **30 days rolling**, updated at most once a day, matching the web.
- **Server-side revocation:** deleting/revoking the row logs that device out immediately, just like the web `Session` table.
- Password reset must also delete the user's `MobileSession` rows (the web reset already deletes `Session` rows).
- Every request resolves the user's **current roles from the database**, not from the token, so removing a volunteer tag takes effect immediately.

### 5.3 Login methods (all reuse existing rules)
| Method | Rules |
|---|---|
| **Email + password** | Same as web: lowercase email, bcrypt compare, Upstash rate limit (10 per 5 min per IP), generic "Invalid credentials". Google-only account → `GoogleOnlyAccount` error with a "Set password" action (reuses `request-set-password`). Unverified user gets a **restricted token** that can only call resend-verification and "me". |
| **Signup** | Same Zod password rules (8–128 chars, upper, lower, digit), same rate limit (5 per 15 min per IP). Verification email goes out via SES; the link opens the **web** verify page. |
| **Google** | Native Google Sign-In gives an **ID token**; the server verifies it with Google, requires `email_verified = true`, and applies the same three linking cases as web (new user, link to existing email/password user, existing Google user). Android and iOS have **separate OAuth client IDs**; the server must accept all three audiences (web, Android, iOS). |
| **Sign in with Apple** | Required by Apple if the iOS app offers Google (see Q1). Stored as an `Account` row with `provider = "apple"`. Apple may return a **private relay email**; SES mail to it only works if the sending domain is registered with Apple. Relay-email users are treated as personal-email users for MNIT verification. |

### 5.4 Shared logic, not copied logic
The credential check, Google account linking, signup, token generation, and role lookup exist today inside the E-Cell codebase. The E-Summit codebase (which will host the app API) must **not re-implement them differently**. Recommendation: move this logic into a **shared internal package** (or at minimum copy it verbatim and keep a test suite proving identical behavior) before building the app endpoints. This is the same recommendation as `BACKEND_HANDOVER.md` §9.

### 5.5 Where the app API lives
`https://esummit.ecellmnit.org/api/app/v1/*`, inside the **E-Summit Next.js project** (the one that owns E-Summit tables). No CORS needed for native clients. Every route is versioned (`/v1`) and the app sends `X-App-Version` and `X-Platform`; `AppConfig` can force an update (§9.4).

### 5.6 Secure web handoff (so "Buy Ticket" does not ask the user to log in again)
Problem: the user is logged in **inside the app**, but the phone's browser has no session. Sending them to the ticket page would force a second login.

Flow:
1. User taps **Buy Ticket**, **Upgrade**, **Upload ID**, **Claim free pass**, **Verify MNIT status**, or **Apply as CA**.
2. App calls `POST /api/app/v1/auth/web-handoff` with the target path (for example `/tickets`).
3. Server checks the path against a **short allowlist** (`/tickets`, `/accommodation`, `/id-upload`, `/profile`, `/ca/apply`, `/verify-mnit`) and creates a `WebHandoffToken` (hashed, **valid 60 seconds, single use**, bound to the user).
4. Server returns `https://esummit.ecellmnit.org/auth/app-handoff?code=<raw>`.
5. The app opens that URL in the **in-app browser** (Safari View Controller / Chrome Custom Tabs). The website exchanges the code for a normal NextAuth `Session` + cookie on `.ecellmnit.org`, then redirects to the target path.
6. After payment the user returns to the app (close the browser, or a `esummit://my-pass?refresh=1` deep link). The **My Pass** screen refetches whenever the app comes to the foreground.

Rules: rate-limited, the code is burned on first use even if the redirect fails, unknown `next` paths are rejected, and codes are never logged.

**Known limitation:** web sessions created by handoff are normal 30-day web sessions. App "Log out" revokes the app session only. **"Log out everywhere"** (§8.3) deletes all `Session` and `MobileSession` rows for the user.

### 5.7 Account deletion (store requirement)
Apple and Google both require in-app account deletion when an app allows account creation. `POST /api/app/v1/account/delete` (re-authenticate first) must follow the schema constraints from the handover:
- `Account`, `Session`, tokens, and `EventRegistration` cascade-delete.
- `Event.createdById`, `GalleryItem.uploadedById`, `AuditLog.performedById`, `BroadcastLog.sentById` have **no cascade**, so a plain delete **fails** for editors/admins. Rule: **deletion is blocked for accounts with EDITOR/ADMIN; they must be demoted first.**
- Tickets, orders, and payment records must be kept for accounting, so for those the user row is **anonymized** (name → "Deleted user", phone/photo/college cleared, email replaced with a non-routable placeholder) rather than hard-deleted. This is a **recommendation** (see Q8).

---

## 6. Roles and the Volunteer / Member Scan Tab

### 6.1 Today's reality (EXISTING)
`User.role` is a single enum: `STUDENT | EDITOR | ADMIN`. **There is no Volunteer or Member tag in the database yet.**

### 6.2 What the app needs (NEW-APP, builds on PLANNED `UserSiteRole`)
The system spec already plans to replace `User.role` with a per-site table `UserSiteRole`. The app needs two more role values:

```
UserSiteRole
  id, userId (fk), site (ECELL | ESUMMIT)
  role  (STUDENT | EDITOR | ADMIN | CAMPUS_AMBASSADOR | VOLUNTEER | MEMBER)
  grantedById (fk User), grantedAt
  UNIQUE (userId, site, role)
```
Two important points:
- The unique key is **(userId, site, role)**, not (userId, site). A person can be a CA **and** a volunteer at once.
- The Scan tab is allowed when the user has `site = ESUMMIT` and `role ∈ {VOLUNTEER, MEMBER}`.

**Who can scan:** Volunteer or Member tag only (as decided). An Admin who also needs to scan can simply be given the Volunteer tag. See Q4.

### 6.3 Server enforcement
- Every `/api/app/v1/scan/*` route calls a `requireScannerRole()` guard that reads `UserSiteRole` from the database on every request.
- The app learns about the tag from `GET /api/app/v1/me` (`features: { scanner: true }`) only to decide whether to *show* the tab. The server never trusts the app for this.
- Tags are granted and removed in the **E-Summit admin panel** (Users page, bulk CSV import for volunteer lists). Each change is written to `AuditLog`.
- When a tag is removed, the next API call fails with 403 and the app **wipes the offline scan pack and queue** from the device.

---

## 7. Feature Behavior Details

### 7.1 My Pass (ticket status)
States, in the order the app checks them:

| State | What the user sees | Button |
|---|---|---|
| Logged out | Login prompt | Log in |
| No ticket | "You don't have a ticket yet" | **Get ticket** (web, handoff). Verified MNIT students see **Claim free pass** (web). Unverified personal-email MNIT students see **Verify MNIT status** (web). |
| Paid, waiting for ID (non-MNIT, window open) | "ID verification pending" | **Upload ID** (web) |
| Active ticket | Ticket QR, attendee name, ticket type, status, checked-in flag | **Upgrade** if a higher paid tier exists (web) |
| In a group | Group QR visible to **every** member (system spec §6.4), group name, members read-only | none (join/create is web) |
| Accommodation booked | Nights, and **hostel/room/bed once assigned** (from `BedAssignment`) | none |

The QR is generated **on the device** from the stored code string, so it renders with no network. The screen raises brightness while open. Cached ticket data shows "Last updated <time>" when offline. The app refetches on foreground, because ticket **transfer** re-issues the QR and invalidates the old one (system spec §2.10).

### 7.2 QR codes
- QR content: `ES1.<qrCode>` where `qrCode` is the existing unique random value on `Ticket` (and on `Group` for the Group QR). Opaque and unguessable (at least 128 bits).
- Ticket QR → attendance, event check-in, and (for solo attendees) kit.
- Group QR → kit desk for the whole group.
- One QR per person for everything; **event check-in uses the same Ticket QR** (§7.7), so there is no per-event QR to generate.

### 7.3 Event registration
Reuses the existing rules (EXISTING `registerForEvent` behavior):
- Allowed only when `registrationEnabled = true` **and** `registrationStatus = OPEN`.
- If `capacity` is not null and current registrations ≥ capacity → "This event is at capacity."
- Duplicate registration is blocked by the unique `(eventId, userId)` constraint (Prisma `P2002` → "You are already registered").
- Cancel registration deletes the row.
- On success, SES sends the existing confirmation email.
- **New (proposed):** `Event.requiresTicket`. If true and the user has no active ticket, the app shows "You need a ticket for this event" with the Buy button instead of Register. Default false. See Q3.

### 7.4 Campus map
- Data: `CampusLocation` (§9.3). Admin-managed with categories.
- v1 UI: category chips, search, list with distance (device location, **foreground only, never stored on the server**), and **Open in Google Maps** using the universal directions URL (`https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`), which needs no API key and works on both platforms.
- The `FOOD` category means **existing campus canteens/stalls**, not organizer-provided food (the event provides no food; see system spec §0.1). The FAQ already says this and the category label should avoid confusion.
- An in-app pin map (react-native-maps) is a possible later addition; it needs a Google Maps API key for Android and billing setup.

### 7.5 Push notifications
Categories (user can switch each off, stored in `NotificationPreference`):
| Category | Examples | Default |
|---|---|---|
| `EVENT_REMINDERS` | "Startup Pitch starts in 30 minutes" (only for events the user registered for) | on |
| `ANNOUNCEMENTS` | Admin broadcast to chosen audience | on |
| `LIVE_UPDATES` | "Hall B moved to Hall C" (when the admin ticks "also send push") | on |
| `TICKET_UPDATES` | Ticket confirmed, ID verified, accommodation assigned | on |

Sending:
- **Reminders:** a cron (same pattern as the existing Vercel Cron at `/api/cron/event-status`) runs every few minutes, finds events starting inside the reminder window, and notifies registered users. `NotificationDelivery` has a unique `(userId, kind, refId)` so nobody gets a duplicate if the cron overlaps.
- **Broadcasts:** admin creates a `PushCampaign` with an audience (everyone, ticket holders, registrants of one event, CAs, volunteers), optional schedule, optional deep link.
- The OS permission prompt is requested **after** login at a sensible moment (for example after the first registration), not on first launch.
- Dead tokens (the provider reports "not registered") are disabled automatically (`PushDevice.disabledAt`).
- Recommended provider for v1: **Expo Push Service**, which wraps FCM and APNs and is the simplest with React Native; direct FCM/APNs can replace it later (Q10).

### 7.6 Emergency and safety card
- Pulls `HelpContact` rows with `isEmergency = true` (security, medical, helpdesk) and the nearest `CampusLocation` of category `MEDICAL`.
- Shows the user's **own emergency contact** (name and phone) read-only if their ticket has one (`Ticket.emergencyContactName/Phone`, required for accommodation bookings).
- One-tap call buttons. Cached for offline.

### 7.7 Volunteer scanner (three modes, one engine)

**Modes**
| Mode | Scans | Effect |
|---|---|---|
| **Attendance** | Ticket QR | Marks `Ticket.checkedIn = true`, `checkedInAt`; repeat scans rejected as "Already checked in at <time>". |
| **Kit collection** (only if `EsummitConfig.kitSystemEnabled`) | Group QR → whole group; Solo Ticket QR → one kit | Marks `Group.kitCollected` or `Ticket.kitCollected`. A **group member's own Ticket QR** shows *"[Name] belongs to group '[Group]' — scan the group's QR instead"* plus leader name (phone when online), with a **logged manual override** (system spec §6.3). |
| **Event check-in** | Ticket QR with an **event selected** | Server confirms the user has an `EventRegistration` for that event, then writes an `EventCheckIn` row (unique per event and user). Unregistered → "Not registered for this event". |

**Online flow:** the app sends one scan to `POST /api/app/v1/scan/batch` (a batch of one) and shows the server's result.

**Offline flow**
1. Before the event (or whenever online) the app downloads an **offline pack** via `GET /api/app/v1/scan/offline-pack`: for each valid ticket, a **hash** of the QR code, first name + last initial (or full name), ticket type, group name, leader name, and current `checkedIn`/`kitCollected` flags. **No phone, email, or ID data.**
2. The pack is stored **encrypted** on the device (key in Keychain/Keystore) and is wiped on logout, role removal, or after it expires.
3. While offline, a scan is validated against the local pack, the result is shown immediately, and the scan is saved in a **local queue** with a client-generated UUID (`clientScanId`).
4. On reconnect the queue syncs through `scan/batch`. The server is **idempotent** on `clientScanId`, so retries never double-apply.
5. **Conflicts:** two volunteers offline can scan the same ticket. The **first scan to reach the server wins**; the later one comes back as `DUPLICATE_SYNC` and is shown to the volunteer and listed in the admin scan report. For attendance this is harmless. For kits, run the kit desk with connectivity where possible.

**Concurrent safety (server):** check-in and kit updates are single atomic statements of the form "set checkedIn = true **where** id = ? **and** checkedIn = false". If zero rows change, the ticket was already processed. This prevents two volunteers racing on the same ticket (system spec §6.3).

**Audit:** every scan, including rejected ones and overrides, writes a `ScanLog` row (who, device, mode, result, device time, server time).

**Camera:** `expo-camera`/vision-camera barcode scanning, torch toggle, continuous scan with a 1.5-second debounce, haptic + sound feedback, large readable result screen.

### 7.8 CA card
Shown if the user has an `APPROVED` `CampusAmbassador` row. Reads referral code, attributed count (`ReferralAttribution`), and rank (computed the same way as the web dashboard and leaderboard). Share link format `https://esummit.ecellmnit.org/?ref=<referralCode>` (matches the system spec's referral cookie mechanism). The promo poster is the existing `promoAssetUrl`.

### 7.9 Deep links
Universal Links (iOS) and App Links (Android) on `esummit.ecellmnit.org`, plus the custom scheme `esummit://`.

| Link | Opens |
|---|---|
| `/events/{slug}` | Event detail |
| `/live-updates` | Live Updates |
| `/faq` | FAQ |
| `/my-pass` | My Pass (used after web purchase) |
| `/speakers/{id}` | Speaker detail |

Requires hosting `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json` on the E-Summit site. **Verify-email and reset-password links are intentionally not claimed by the app**; they stay web pages.

### 7.10 Add to calendar
Uses the device calendar API with a permission prompt. Start/end come from `Event.date` and the new `Event.endDate`. If calendar permission is denied, share an `.ics` file instead.

### 7.11 Profile and settings
Mirrors the web profile and calls the same business rules as `/api/profile/update` and `/api/profile/photo`:
- Fields: name, gender, phone, college/institution, plus whatever onboarding fields §9.6 settles on.
- Photo: pick → crop to square → compress on device → upload (server limit **8 MB**, resized to 400×400 WebP, old S3 object deleted).
- Toggles: promotional emails (per site, see §9.6 gap G3) and the four notification categories.
- Actions: Log out, **Log out everywhere**, **Delete account**.
- Shows email verification state and, for personal-email users, a **Verify MNIT status** button (opens web in v1).

---

# PART B — BACKEND AND DATA

## 8. App API Surface (`/api/app/v1`, NEW-APP)

All routes: JSON, bearer auth unless noted, rate-limited through the existing Upstash setup (new `rl:app:*` keys), errors in one consistent shape `{ error, code }`. Headers `X-App-Version`, `X-Platform` required.

### 8.1 Config and content
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/config` | none | `AppConfig`: min/latest versions, maintenance, store URLs, feature flags (`kitSystemEnabled`, `caApplicationsOpen`, `idSubmissionOpen`). |
| GET | `/screens/{key}` | none (draft needs Editor/Admin) | SDUI layout. ETag + CDN-cacheable. |
| GET | `/events` | optional | Filters: `day`, `category`, `happeningNow`, `upcoming`, `ids`. Adds `registered` flag when logged in. Only `site = ESUMMIT`. |
| GET | `/events/{slug}` | optional | Detail with venue, speakers, registration state. |
| POST | `/events/{id}/register` | user | Existing rules (§7.3). |
| DELETE | `/events/{id}/register` | user | Cancel. |
| GET | `/locations` | none | `CampusLocation` list. |
| GET | `/speakers`, `/speakers/{id}` | none | |
| GET | `/sponsors` | none | Existing `Sponsor` rows (see §9.4 on separating E-Summit sponsors). |
| GET | `/faq` | none | `FAQItem`. |
| GET | `/live-updates` | none | Active `LiveUpdate` rows. |
| GET | `/contacts` | none | `HelpContact` rows. |

### 8.2 Account and pass
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | none | Same rules as web signup. |
| POST | `/auth/login` | none | Email + password → bearer token. |
| POST | `/auth/google` | none | Google ID token → bearer token. |
| POST | `/auth/apple` | none | Apple identity token → bearer token. |
| POST | `/auth/resend-verification` | restricted | Reuses existing logic. |
| POST | `/auth/forgot-password` | none | Reuses existing logic (link opens web). |
| POST | `/auth/request-set-password` | none | For Google-only users. |
| POST | `/auth/logout` | user | Revoke this `MobileSession`. |
| POST | `/auth/logout-all` | user | Delete all `Session` and `MobileSession` rows. |
| POST | `/auth/web-handoff` | user | Create one-time web link (§5.6). |
| GET | `/me` | user | Profile, roles for site ESUMMIT, `features`, onboarding state, MNIT status, notification prefs. |
| POST | `/onboarding/complete` | verified | Same fields/rules as web onboarding. |
| PATCH | `/profile` | user | Same rules as `/api/profile/update`. |
| POST | `/profile/photo` | verified | Multipart upload, same pipeline. |
| POST | `/account/delete` | user | §5.7. |
| GET | `/pass` | user | Ticket, QR codes, group, accommodation assignment, emergency contact, ID state. |
| GET | `/ca/me` | CA | CA card data. |
| POST | `/devices` | user | Register/update push token and platform. |
| DELETE | `/devices/{id}` | user | Unregister (on logout). |
| PATCH | `/notification-preferences` | user | Category toggles. |

### 8.3 Scanner (role-gated)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/scan/offline-pack` | Volunteer/Member | Hashed code list (§7.7). `ETag` supported. |
| POST | `/scan/batch` | Volunteer/Member | Up to 100 scans: `clientScanId`, `mode`, `code`, `eventId?`, `scannedAt`, `override?`. Returns per-scan result. |
| GET | `/scan/summary` | Volunteer/Member | This user's counts and recent conflicts. |

Result codes: `OK`, `ALREADY_PROCESSED`, `INVALID_CODE`, `NOT_REGISTERED_FOR_EVENT`, `GROUP_MEMBER_USE_GROUP_QR`, `KIT_SYSTEM_DISABLED`, `WRONG_MODE`, `DUPLICATE_SYNC`, `OVERRIDDEN`.

### 8.4 Cron jobs (NEW-APP, added to the E-Summit project's Vercel Cron)
| Path | Frequency | Purpose |
|---|---|---|
| `/api/cron/event-reminders` | every 5 min | Send reminder pushes inside the window; dedupe via `NotificationDelivery`. |
| `/api/cron/push-campaigns` | every 5 min | Send scheduled `PushCampaign` rows. |
| `/api/cron/cleanup-app-tokens` | daily | Delete expired `MobileSession` and `WebHandoffToken` rows. |

All use the existing `Authorization: Bearer <CRON_SECRET>` pattern. Note: **frequent Vercel Cron schedules need a paid Vercel plan**; confirm the plan before relying on 5-minute schedules.

---

## 9. Database Schema

### 9.0 Ground rules (from `BACKEND_HANDOVER.md`)
- PostgreSQL on **AWS RDS, ap-south-1**. Prisma **v7.9.1** with `prisma-client` generator and `@prisma/adapter-pg`. Generated client is at `src/generated/prisma`.
- **The E-Cell repository is the only place that runs schema changes.** The E-Summit and app work never runs `prisma migrate dev`, `migrate reset`, or `db push --force-reset` against the shared database. There is currently **no `prisma/migrations` directory**; the schema was synced with `db push`/SQL. All additions in this document are **additive** (new tables, new nullable or defaulted columns) and must be applied as reviewed SQL, tested on a staging copy first.
- **RDS Proxy is not set up.** Two Next.js apps plus app traffic on event day can exhaust `max_connections`. Enable RDS Proxy (or PgBouncer) and point both `DATABASE_URL`s at it **before** launch.
- Never alter, rename, or drop existing columns on shared models.

### 9.1 EXISTING — E-Cell database (15 models, 5 enums)

**Enums**
```
Role                 STUDENT | EDITOR | ADMIN
RegistrationStatus   NOT_STARTED | OPEN | CLOSED
StartupStatus        PENDING | APPROVED | REJECTED
MediaType            IMAGE | VIDEO
StorageProvider      S3 | DRIVE
```

**User** — core identity
```
id                      String   PK cuid()
email                   String   UNIQUE (stored lowercase)
emailVerified           DateTime?
passwordHash            String?  bcrypt, 10 rounds; null for Google-only
name                    String
gender                  String?  MALE | FEMALE | NON_BINARY | PREFER_NOT_TO_SAY
phoneNumber             String?
branch                  String?  (currently stores COLLEGE from onboarding)
year                    Int?     (currently stores AGE from onboarding)
hostelOrDayScholar      String?
profilePhotoUrl         String?  CloudFront URL, 400x400 WebP
role                    Role     default STUDENT
onboardingCompleted     Boolean  default false
promotionalEmailsOptIn  Boolean  default false
resendAudienceId        String?
createdAt, updatedAt    DateTime
Relations: accounts, sessions, emailVerificationTokens, passwordResetTokens,
           eventRegistrations, createdEvents, submittedStartups,
           uploadedGalleryItems, auditLogs, broadcastsSent
```

**Account** — NextAuth provider links
```
id PK cuid | userId FK→User (Cascade, indexed)
type, provider, providerAccountId   UNIQUE(provider, providerAccountId)
refresh_token Text?, access_token Text?, expires_at Int?, token_type?,
scope?, id_token Text?, session_state?
```

**Session** — web database sessions
```
id PK | sessionToken UNIQUE | userId FK→User (Cascade, indexed)
expires DateTime        (30-day rolling, update age 24h)
```

**EmailVerificationToken** / **PasswordResetToken** (identical shape)
```
id PK | userId FK→User (Cascade, indexed) | tokenHash UNIQUE (bcrypt of 64-hex raw token)
expiresAt (24h for verification, 30min for reset) | usedAt? | createdAt
```

**Event**
```
id PK | title | slug UNIQUE (indexed) | description Text
date DateTime (indexed)  start date/time
location String          venue text or virtual link
bannerImageUrl String?
registrationEnabled Boolean default false
registrationStatus RegistrationStatus default NOT_STARTED
registrationOpensAt DateTime?, registrationClosesAt DateTime?   (cron driven)
capacity Int?            null = unlimited
createdById FK→User (no cascade, indexed)
createdAt, updatedAt
Relations: registrations, galleryItems, createdBy
NOTE: no end date, no category, no venue FK, no site discriminator today.
```

**EventRegistration**
```
id PK | eventId FK→Event (Cascade) | userId FK→User (Cascade, indexed)
registeredAt | UNIQUE(eventId, userId)
```

**Startup**
```
id PK | name | slug UNIQUE | description Text | founderNames String[]
logoUrl? | websiteUrl? | status StartupStatus default PENDING (indexed)
submittedById FK→User? (SetNull, indexed) | createdAt, updatedAt
```

**GalleryItem**
```
id PK | title? | mediaUrl | mediaType (indexed) | storageProvider
eventId FK→Event? (SetNull, indexed) | uploadedById FK→User (no cascade, indexed)
createdAt, updatedAt
```

**TeamSection** `id, name, displayOrder (indexed), createdAt, updatedAt` → **TeamMember** (Cascade)
**TeamMember** `id, name, roleTitle, photoUrl?, bio Text?, linkedinUrl?, email?, socialLinks Json default {}, displayOrder, batchYear (indexed), sectionId FK→TeamSection (Cascade), createdAt, updatedAt`
**Testimonial** `id, quote Text, name, role, displayOrder, createdAt, updatedAt`
**Sponsor** `id, name, logoUrl, websiteUrl?, tier String? (indexed; e.g. TITLE, GOLD, SILVER), displayOrder, createdAt, updatedAt`
**AuditLog** `id, performedById FK→User (no cascade), action String, entityType String, entityId String, details Json default {}, createdAt` — indexes on performedById, (entityType, entityId), createdAt
**BroadcastLog** `id, subject, sentById FK→User (no cascade), resendBroadcastId?, createdAt`

**S3 key prefixes in use:** `profile-photos/{userId}/{ts}.webp`, `gallery/{uuid}.{ext}`, `team/{uuid}.{ext}`, `sponsors/{uuid}.{ext}`. Hot media is served via CloudFront (`AWS_CLOUDFRONT_DOMAIN`), bulk media via Google Drive.

### 9.2 PLANNED — E-Summit website tables (from `esummit_system_spec.md`)
Not built yet. The app reads most of these. Names and fields below are the current plan; the E-Summit developer finalizes exact types.

```
EsummitConfig (singleton)
  id, caApplicationsOpen, idSubmissionOpen, idSubmissionOpenedAt?, kitSystemEnabled, updatedAt

CampusAmbassador         id, userId FK, applicationStatus (PENDING|APPROVED|REJECTED), referralCode UNIQUE, promoAssetUrl?, joinedAt
ReferralAttribution      id, campusAmbassadorId FK, ticketId FK, attributedAt
CARewardTier             id, thresholdCount, rewardDescription, displayOrder
CALeaderboardSnapshot    id, campusAmbassadorId FK, periodLabel, referralCountAtSnapshot, snapshotAt

TicketType               id, name, price, quantityAvailable, saleStartsAt, saleEndsAt, description, isFreeForMnitOnly default false
PromoCode                id, code UNIQUE, discountType (PERCENTAGE|FLAT), discountValue, maxUses?, usesCount, validFrom, validUntil, active
Ticket                   id, ticketTypeId FK, userId FK (ONE active ticket per user, enforced in app code),
                         attendeeName, attendeeGender (MALE|FEMALE), attendeePhone, attendeeEmail, attendeeInstitution?,
                         promoCodeId? FK, groupId? FK,
                         wantsAccommodation, accommodationNights?, accommodationFee? (snapshot),
                         emergencyContactName?, emergencyContactPhone? (required if accommodation),
                         waiverAccepted, waiverAcceptedAt,
                         qrCode UNIQUE, checkedIn default false, checkedInAt?, kitCollected default false,
                         idDocumentUrl?, idDocumentType? (AADHAR|PASSPORT|VOTER_ID|DRIVING_LICENSE|OTHER), idSubmittedAt?,
                         orderId FK
TicketUpgradeLog         id, ticketId FK, fromTicketTypeId, toTicketTypeId, priceDifferencePaid, upgradeOrderId FK, upgradedAt
TicketTransferLog        id, ticketId FK, previousAttendeeName, previousAttendeeEmail, transferredAt

Group                    id, name, inviteCode UNIQUE, leaderTicketId FK, maxSize, qrCode UNIQUE, kitCollected default false, kitCollectedAt?, createdAt
RoomBlock                id, hostelName, genderDesignation (MALE|FEMALE), roomNumber, bedCapacity
BedAssignment            id, ticketId FK, roomBlockId FK, bedLabel, assignedAt
AccommodationPricing     (singleton) id, pricePerNight, updatedAt

Order                    id, amount, status (CREATED|PAID|FAILED|EXPIRED|REFUNDED), orderType (TICKET_PURCHASE|TICKET_UPGRADE),
                         razorpayOrderId, razorpayPaymentId, razorpaySignature, expiresAt, ticketId FK

KitOverrideLog           id, ticketId FK, performedByAdminId FK, reason, timestamp
OfflineScanQueue         id, deviceId, scanType (ATTENDANCE|KIT), scannedCode, scannedAt, syncedAt?
DriveSyncCheckpoint      id, lastSyncedAuditLogId, lastSyncedAt
LiveUpdate               id, message, isActive, postedAt
FAQItem                  id, question, answer, displayOrder

User additions (shared-account plan, system spec §0.4)
  signupSource (ECELL|ESUMMIT), userType (MNIT_STUDENT|EXTERNAL), mnitVerified, mnitEmail? UNIQUE,
  institution?, city?; branch/year/hostelOrDayScholar become MNIT-only
  single `role` replaced by UserSiteRole
UserSiteRole             id, userId FK, site (ECELL|ESUMMIT), role (STUDENT|EDITOR|ADMIN|CAMPUS_AMBASSADOR)
```

**Changes this app makes to PLANNED tables**
| Table | Change | Why |
|---|---|---|
| `UserSiteRole` | Add role values `VOLUNTEER`, `MEMBER`; unique on `(userId, site, role)`; add `grantedById`, `grantedAt` | Scan tab access (§6). |
| `OfflineScanQueue` | **Remove.** The offline queue lives on the device; the server uses `ScanLog` (§9.3) with idempotent `clientScanId`. | Server table cannot hold a device-local queue. |
| `KitOverrideLog` | Rename `performedByAdminId` → `performedById` (volunteers/members override at the desk) | Overrides are done by scanner roles. |
| `LiveUpdate` | Add `title?`, `severity` (INFO|IMPORTANT), `linkUrl?`, `expiresAt?`, `pinned` | Home banner and feed. |
| `Ticket` | No schema change. App reads `qrCode`, `checkedIn`, `kitCollected`, emergency contact, ID state. | — |

### 9.3 NEW-APP — new tables

```
MobileSession                       (app login sessions)
  id PK cuid
  userId FK→User (Cascade, indexed)
  tokenHash String UNIQUE           SHA-256 of 256-bit random token
  deviceId String                   app-generated install id
  deviceName String?
  platform  (IOS | ANDROID)
  appVersion String
  createdAt, lastUsedAt, expiresAt
  revokedAt DateTime?
  indexes: (userId), (expiresAt)

WebHandoffToken                     (one-time app→web login, §5.6)
  id PK
  userId FK→User (Cascade)
  tokenHash String UNIQUE
  nextPath String                   must pass the allowlist
  expiresAt DateTime                created + 60 seconds
  usedAt DateTime?
  createdAt

PushDevice
  id PK
  userId FK→User (Cascade, indexed)
  pushToken String UNIQUE           Expo push token (or FCM/APNs token)
  platform (IOS | ANDROID)
  deviceId String
  appVersion String
  locale String?
  lastSeenAt, createdAt
  disabledAt DateTime?              set when the provider says the token is dead

NotificationPreference
  userId PK, FK→User (Cascade)
  eventReminders Boolean default true
  announcements  Boolean default true
  liveUpdates    Boolean default true
  ticketUpdates  Boolean default true
  updatedAt

PushCampaign
  id PK
  title, body
  audienceType (ALL | TICKET_HOLDERS | EVENT_REGISTRANTS | CAMPUS_AMBASSADORS | VOLUNTEERS)
  audienceRefId String?             e.g. eventId for EVENT_REGISTRANTS
  deepLink String?
  category (ANNOUNCEMENTS | LIVE_UPDATES | TICKET_UPDATES)
  status (DRAFT | SCHEDULED | SENDING | SENT | FAILED)
  scheduledAt?, sentAt?, recipientCount Int?
  createdById FK→User (no cascade), createdAt

NotificationDelivery                (dedupe + history)
  id PK
  userId FK→User (Cascade)
  kind (EVENT_REMINDER | CAMPAIGN | LIVE_UPDATE | TICKET_UPDATE)
  refId String                      eventId, campaignId, etc.
  sentAt
  UNIQUE (userId, kind, refId)

CampusLocation
  id PK
  name
  category (HOSTEL | VENUE | FOOD | PARKING | HELP_DESK | MEDICAL | WASHROOM | ATM | GATE | OTHER)
  description Text?
  latitude Float, longitude Float
  imageUrl String?                  S3/CloudFront, prefix `locations/`
  displayOrder Int, isActive Boolean default true
  createdAt, updatedAt
  indexes: (category), (displayOrder)

Speaker
  id PK
  name, designation, organization
  bio Text?, photoUrl String?       prefix `speakers/`
  linkedinUrl String?
  isFeatured Boolean default false, displayOrder Int
  createdAt, updatedAt

EventSpeaker
  eventId FK→Event (Cascade), speakerId FK→Speaker (Cascade)
  displayOrder Int
  PK (eventId, speakerId)

HelpContact
  id PK
  label, description String?
  category (HELPDESK | SECURITY | MEDICAL | TRANSPORT | OTHER)
  phone String?, whatsapp String?, email String?
  isEmergency Boolean default false
  displayOrder Int, isActive Boolean default true

AppScreen                           (SDUI layouts)
  id PK
  key String UNIQUE                 HOME | MORE | HELP | EVENT_DETAIL_TEMPLATE | ...
  title String
  draftJson Json
  publishedJson Json
  publishedVersion Int default 0
  minAppVersion String?
  updatedById FK→User, updatedAt, publishedAt?

AppScreenVersion                    (history and rollback)
  id PK
  screenId FK→AppScreen (Cascade)
  version Int
  json Json
  note String?
  publishedById FK→User, publishedAt
  UNIQUE (screenId, version)

AppConfig (singleton)
  id
  minSupportedVersionIos, minSupportedVersionAndroid
  latestVersionIos, latestVersionAndroid
  maintenanceMode Boolean default false, maintenanceMessage String?
  iosStoreUrl, androidStoreUrl
  offlinePackTtlHours Int default 24
  updatedAt

EventCheckIn
  id PK
  eventId FK→Event (Cascade)
  userId FK→User (Cascade)
  scannedById FK→User (no cascade)
  scannedAt DateTime                device time converted to UTC
  receivedAt DateTime default now() server time
  source (ONLINE | OFFLINE_SYNC)
  deviceId String
  UNIQUE (eventId, userId)

ScanLog                             (every scan attempt, accepted or not)
  id PK
  clientScanId String UNIQUE        idempotency key from the device
  mode (ATTENDANCE | KIT | EVENT_CHECKIN)
  codeHash String                   hash of the scanned QR, never the raw value
  ticketId String?, groupId String?, eventId String?
  result String                     one of the result codes in §8.3
  overrideReason String?
  scannedById FK→User (no cascade, indexed)
  deviceId String
  scannedAt (device time), receivedAt (server time)
  indexes: (scannedById), (mode, receivedAt), (ticketId)
```

### 9.4 NEW-APP — additive changes to EXISTING tables
These touch shared tables, so they need the E-Cell lead's sign-off and the E-Cell site's queries updated at the same time.

| Table | New column | Type / default | Purpose |
|---|---|---|---|
| `Event` | `site` | enum `ECELL | ESUMMIT`, **default ECELL** | Keep E-Summit events off the E-Cell site and vice versa. **The E-Cell site's event queries must add `site = ECELL`** or E-Summit events will leak onto it. |
| `Event` | `endDate` | DateTime? | End time for reminders, "happening now", calendar. |
| `Event` | `venueId` | FK→CampusLocation? (SetNull) | Directions button. `location` text stays as fallback. |
| `Event` | `category` | String? | Filter chips (Talk, Workshop, Competition, ...). |
| `Event` | `requiresTicket` | Boolean default false | See Q3. |
| `Sponsor` | `site` (or reuse `tier` prefix) | enum default ECELL | Separate E-Summit sponsors from E-Cell sponsors. Handover §9 suggests either an `ESUMMIT_*` tier or a dedicated table; pick one (Q11). |
| `AuditLog` | none | — | App/admin-panel actions reuse it with new `entityType` values: `AppScreen`, `PushCampaign`, `CampusLocation`, `Speaker`, `HelpContact`, `UserSiteRole`, `AppConfig`. |

### 9.5 Relationship overview
```
User ─┬─< MobileSession, WebHandoffToken, PushDevice, NotificationDelivery
      ├── NotificationPreference (1:1)
      ├─< UserSiteRole            (PLANNED; includes VOLUNTEER / MEMBER)
      ├─< Ticket (one active) ─< BedAssignment >─ RoomBlock
      │        └── Group (leader)  ─ Group QR
      ├─< EventRegistration >─ Event ─< EventSpeaker >─ Speaker
      │                         ├─< EventCheckIn (user + event, written by scanners)
      │                         └── venueId ─ CampusLocation
      └─< ScanLog (as scanner)

AppScreen ─< AppScreenVersion        LiveUpdate · FAQItem · HelpContact · Sponsor
PushCampaign · AppConfig (singleton) · EsummitConfig (singleton)
```

### 9.6 Known gaps and conflicts to resolve before building
| # | Gap / conflict | Detail | Proposed resolution |
|---|---|---|---|
| G1 | **Onboarding fields do not match the plan** | Today onboarding stores **age in `User.year`** and **college in `User.branch`** (handover §4.6, §8.4). The system spec plans `branch`/`year`/`hostelOrDayScholar` as MNIT-only fields and adds `institution`, `city`. | Decide the final mapping once, in the E-Cell repo, with a data migration. The app must follow it exactly. Do not build onboarding screens against the temporary mapping. |
| G2 | **Roles are still a single enum** | `User.role` only has STUDENT/EDITOR/ADMIN, and the web proxy/middleware and JWT callbacks read it. | Ship `UserSiteRole` and update both sites' guards **before** the app work starts. |
| G3 | **Per-site promotional opt-in has no storage** | System spec §0.4 says opt-in is per site, but `User.promotionalEmailsOptIn` and `resendAudienceId` are single global fields. | Add `UserSiteProfile(userId, site, promotionalEmailsOptIn, resendContactId)` (unique on `userId, site`). |
| G4 | **Cookie domain not configured** | Both sites need the shared-cookie `authOptions` (handover §4.4) and the **same `NEXTAUTH_SECRET`**. | Deploy to both sites together. |
| G5 | **Event table shared** | See `Event.site` in §9.4. | Add `site` and update E-Cell queries. |
| G6 | **Gender value sets differ** | `User.gender` allows `MALE|FEMALE|NON_BINARY|PREFER_NOT_TO_SAY`; `Ticket.attendeeGender` allows only `MALE|FEMALE` (needed for room allocation). | Fine for accommodation, but the ticket form must explain why and how non-binary users are handled. Needs a team decision. |
| G7 | **No RDS Proxy** | Handover §1.1. | Enable before event day. |
| G8 | **No Razorpay anywhere in code yet** | Handover §5.11. | Web-side work only; the app never touches Razorpay. |

---

## 10. Infrastructure and Services for the App

### 10.1 What is reused (no new accounts)
| Service | Used by the app for |
|---|---|
| AWS RDS PostgreSQL | All data (shared). |
| AWS S3 + CloudFront | Images for speakers, locations, banners (new prefixes `speakers/`, `locations/`, `app-banners/`) and profile photos (existing). Same validation and `sharp` WebP pipeline. |
| AWS SES | Verification, reset, registration confirmation emails (unchanged). |
| Upstash Redis | Rate limits for `/api/app/v1/*`. |
| Google service account / Drive | Bulk media and exports (unchanged). |
| Vercel + Vercel Cron | Hosts the app API (inside the E-Summit project) and the reminder/campaign crons. |
| Resend | Promotional email only; unchanged. |

### 10.2 What is new
| Item | Notes |
|---|---|
| **Apple Developer Program** | About US$99 per year. Needed for TestFlight, App Store, push (APNs key), Sign in with Apple, Universal Links. Decide whether it is enrolled as an individual or as an organization (Q2). |
| **Google Play Console** | One-time registration fee (about US$25). New personal accounts may have extra testing requirements before production release; check current Play policy. |
| **Expo / EAS** (recommended) | EAS Build for iOS/Android binaries, EAS Update for JavaScript-only fixes, Expo Push Service for notifications. Bare React Native also works but costs more setup. |
| **Firebase project** | Required by Android push (FCM credentials), even when using Expo Push. |
| **Google OAuth clients** | Add an **Android** and an **iOS** OAuth client to the existing Google Cloud project (the web client stays). |
| **Crash reporting** | Sentry (free tier) recommended. |
| **App identifiers** | Proposed: iOS bundle ID and Android package `org.ecellmnit.esummit`. **These cannot be changed after publishing.** Confirm the app name and listing text first. |
| **Hosted files** | `/.well-known/apple-app-site-association`, `/.well-known/assetlinks.json` on the E-Summit site. |

### 10.3 New environment variables (E-Summit project, app API)
| Variable | Purpose | Scope |
|---|---|---|
| `GOOGLE_ANDROID_CLIENT_ID`, `GOOGLE_IOS_CLIENT_ID` | Accept Google ID tokens from the app (alongside existing `GOOGLE_CLIENT_ID`). | Server |
| `APPLE_BUNDLE_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` | Verify Sign in with Apple tokens (only if Apple sign-in is built). | Server |
| `EXPO_ACCESS_TOKEN` | Send pushes through Expo (if Expo Push is used). | Server |
| `APP_HANDOFF_ALLOWED_PATHS` (or constant in code) | Allowlist for web handoff. | Server |
| `APP_SCAN_PACK_HMAC_KEY` | Key used to hash QR codes in the offline pack. | Server |
| Existing: `DATABASE_URL`, `AWS_*`, `UPSTASH_*`, `SES_FROM_EMAIL`, `CRON_SECRET` | Same values as the E-Cell project where the handover says "SAME". | Server |

### 10.4 App-side configuration (not secrets)
API base URL, Google OAuth client IDs (public by design), Sentry DSN, bundle IDs, and the Universal Link domain. **No AWS keys, database URLs, or service-account keys are ever placed in the app.**

---

# PART C — DELIVERY

## 11. Security, Privacy, and Store Compliance

**Security**
- Tokens only in Keychain/Keystore; never in plain storage or logs.
- All scan, role, and ticket checks are enforced **on the server**; the app UI is never the gate.
- Offline scan pack: hashed codes, minimal names, **no phone/email/ID data**, encrypted at rest, wiped on logout/role removal/expiry.
- Rate limits on login, signup, handoff, and scan endpoints (Upstash).
- Handoff codes: hashed, 60 seconds, single use, path allowlist.
- Location is used **only on-device**, foreground only, and **never sent to or stored by the server**.
- ID documents stay web-only in v1; the app never downloads or displays them.
- Every admin action (layout publish, push campaign, role grant, config change) is written to `AuditLog`.

**Apple App Store (verify wording against the current guidelines at submission time)**
- **Guest access:** apps should not force login for features that do not need an account. §1, row 1 covers this.
- **Sign in with Apple:** needed if the app offers Google login (Q1).
- **Account deletion** inside the app (§5.7).
- **Tickets for a real-world event** bought on an external website are generally allowed; the app should still say plainly "Tickets are sold on our website" so reviewers do not mistake it for a digital-goods purchase.
- **No downloaded executable code:** SDUI is data interpreted by shipped components (§4.8).
- **Privacy:** privacy policy URL (the web `/privacy` page), App Privacy answers (email, name, phone, photo, device ID for push, no tracking).
- **Review access:** provide a **demo account** with a sample ticket and a **second demo account with the Volunteer tag**, so reviewers can see the scanner.

**Google Play**
- Data Safety form, privacy policy link, **in-app and web-based account deletion path**, notification permission handling (Android 13+ runtime prompt), and camera permission justification for the scanner.

**Accessibility:** dynamic text sizes, screen-reader labels, color contrast on the QR and scan result screens.

## 12. Build Phases (Antigravity prompts will follow this order)

| Phase | Work | Where |
|---|---|---|
| 0 | **Backend prerequisites:** onboarding/schema reconciliation (G1), `UserSiteRole` + new roles (G2), shared cookie config (G4), `Event.site` and E-Cell query update (G5), RDS Proxy (G7) | E-Cell repo |
| 1 | New tables from §9.3 and §9.4, applied as reviewed additive SQL | E-Cell repo / DBA step |
| 2 | App API foundation: `/config`, mobile auth (`MobileSession`), `/me`, `/profile`, `/devices`, web handoff | E-Summit repo |
| 3 | App shell: RN project, navigation, theme, secure storage, API client, login/signup/onboarding/profile | App repo |
| 4 | **SDUI engine:** renderer, component registry, action handler, caching, bundled fallback, then Home, More, FAQ, Help | App + E-Summit repos |
| 5 | Events list/detail, registration, add to calendar, Live Updates, speakers, sponsors | App + E-Summit repos |
| 6 | Campus map and emergency card | App + E-Summit repos |
| 7 | **My Pass:** ticket state, offline QR, group QR, handoff buttons, CA card | App + E-Summit repos |
| 8 | Push notifications: devices, preferences, reminder cron, campaigns | App + E-Summit repos |
| 9 | **Volunteer scanner:** role guard, three modes, offline pack and queue, conflict handling, scan log | App + E-Summit repos |
| 10 | **Admin panel additions** (§13) | E-Summit repo |
| 11 | Hardening and store release: load test, offline tests, TestFlight/Play internal testing, store listings, demo accounts | All |

Phases 10 (admin screens) must be ready **before** phases 4–9 can be exercised with real content, so build the admin forms for each feature alongside it.

## 13. E-Summit Admin Panel Additions (NEW-APP)
All inside the **E-Summit admin panel**, never the E-Cell one.
1. **App Layouts:** list screens, form-based section editor, reorder, draft/publish/rollback, version history.
2. **Campus Locations:** CRUD with category, coordinates (paste from Google Maps), photo.
3. **Speakers:** CRUD, link to events.
4. **Help Contacts:** CRUD with emergency flag.
5. **Live Updates / Announcements:** compose, pin, expiry, optional "also send push".
6. **Push Campaigns:** compose, pick audience, schedule, history and delivery counts.
7. **App Config:** minimum/latest versions, maintenance switch, store links.
8. **People and roles:** assign/remove `VOLUNTEER` and `MEMBER` (single and bulk CSV), search by email.
9. **Scan reports:** scans per volunteer and mode, rejected scans, offline conflicts, overrides with reasons, check-in counts per event.
10. **Event fields:** end date, venue (from locations), category, `requiresTicket`, speakers.
11. **Device and push stats** (read-only): active devices by platform and app version.

## 14. Open Questions

| # | Question | Default if undecided |
|---|---|---|
| **Q1** | **Sign in with Apple.** Apple requires an equivalent option when an app offers Google sign-in. Build Sign in with Apple, or remove Google from the app (email/password only; Google-only web users first set a password via the existing flow)? | Build Sign in with Apple. |
| **Q2** | **Who owns the store accounts** (Apple Developer, Google Play): E-Cell/college as an organization, or an individual? Organization enrollment needs more paperwork. | Decide early; it gates TestFlight. |
| **Q3** | **Must a user hold a ticket to register for an event?** (`Event.requiresTicket`) | Per-event flag, default false. |
| **Q4** | **Who may override** group/kit redirects, and should Admins see the Scan tab automatically? | Any scanner role may override with a mandatory reason, logged. Admins get the Volunteer tag if needed. |
| **Q5** | **MNIT verification and free-pass claim in the app or on web?** | Web via handoff in v1. |
| **Q6** | **Shared `Event` table vs a dedicated E-Summit events table.** Shared is simpler but touches the E-Cell site. | Shared with `Event.site`. |
| **Q7** | **Campus map:** list only (current plan) or also an in-app pin map? | List only; pin map later. |
| **Q8** | **Account deletion policy:** anonymize vs hard-delete, retention of ticket/order records, blocked for editors/admins. | Anonymize; block editors/admins. |
| **Q9** | **App name, store listing, edition/dates, bundle ID** (`org.ecellmnit.esummit` proposed). | Confirm before any store setup. |
| **Q10** | **Framework setup and push provider:** Expo managed + Expo Push (recommended) vs bare RN + direct FCM/APNs. | Expo. |
| **Q11** | **Sponsors:** `site` column on `Sponsor`, an `ESUMMIT_*` tier prefix, or a separate `SummitSponsor` table. | `site` column. |
| **Q12** | **Scan data retention:** how long to keep `ScanLog`, `EventCheckIn`, and offline packs after the event. | Offline packs: wiped on expiry. Logs: decide with the ID-retention question. |
| **Q13** | **Per-site promo opt-in storage** (`UserSiteProfile`, G3). | Add the table. |
| **Q14** | **Gender handling for accommodation** vs non-binary users (G6). | Team decision. |
| **Q15** | Confirm the **interpretations** in §1.5 (Events list stays; CA rank stays; reminders only for registered events). | As written. |

---

## 15. Not Yet Built
Everything here is planning only. After the team answers the open questions, the next outputs are:
1. Updated `esummit_system_spec.md` cross-references (done in part: app and scanner roles).
2. **Antigravity prompts** for Phase 0–2 (backend), then the app build (Phases 3–11), in that order.
3. E-Summit **app UI/design prompts** using the E-Summit brand assets.
4. A refreshed `BACKEND_HANDOVER.md` once `UserSiteRole`, `Event.site`, and the new tables exist.
