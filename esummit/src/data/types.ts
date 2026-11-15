/**
 * Frontend content types.
 *
 * Shapes follow the backend docs (mobile-api-v1.md, openapi-v1.yaml and
 * esummit_app_spec §9). Where the UI needs fields the API does not return
 * yet, they are marked "UI-only". The backend field each one maps to is
 * noted so the API adapter is mechanical when the backend is wired up.
 */

/** Matches backend enum `RegistrationStatus`. */
export type RegistrationStatus = 'NOT_STARTED' | 'OPEN' | 'CLOSED';

export type EventCategory = 'Competition' | 'Talk' | 'Workshop' | 'Networking' | 'Showcase';

/** 1-indexed summit day. */
export type SummitDay = 1 | 2 | 3;

export interface Coordinator {
  name: string;
  phone: string;
}

/**
 * An event as the UI uses it.
 *
 * Backend mapping (GET /events, GET /events/{slug}):
 *   id            ← Event.id
 *   slug          ← Event.slug
 *   name          ← Event.title
 *   description   ← Event.description
 *   date+startTime← Event.date (ISO datetime)
 *   venue         ← Event.location
 *   image         ← Event.bannerImageUrl
 *   seatsTotal    ← Event.capacity
 *   seatsLeft     ← Event.capacity - Event.registeredCount
 *   registrationEnabled / registrationStatus / isRegistered ← same name
 *   category, day, endTime, venueId, prizePool, rules, coordinator → UI-only (not in API v1)
 */
export interface SummitEvent {
  id: string;
  slug: string;
  name: string;
  category: EventCategory;
  day: SummitDay;
  /** ISO date, e.g. "2027-02-12". */
  date: string;
  /** 24h "HH:mm". */
  startTime: string;
  endTime: string;
  venue: string;
  /** Points to a `Venue.id`. */
  venueId: string;
  /** Display string, e.g. "₹50,000". Omit for events without prizes. */
  prizePool?: string;
  /** Remote URL. `null` shows the category placeholder. */
  image: string | null;
  description: string;
  rules: string[];
  coordinator: Coordinator;
  seatsTotal: number | null;
  seatsLeft: number | null;
  registrationEnabled: boolean;
  registrationStatus: RegistrationStatus;
  isRegistered?: boolean;
}

/** Matches `CampusLocation.category` in the app spec §9.3. */
export type VenueCategory =
  | 'HOSTEL'
  | 'VENUE'
  | 'FOOD'
  | 'PARKING'
  | 'HELP_DESK'
  | 'MEDICAL'
  | 'WASHROOM'
  | 'ATM'
  | 'GATE'
  | 'OTHER';

/** Matches `CampusLocation` (app spec §9.3). */
export interface Venue {
  id: string;
  name: string;
  category: VenueCategory;
  description: string | null;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
}

/** Matches `Speaker` (app spec §9.3). */
export interface Speaker {
  id: string;
  name: string;
  designation: string;
  organization: string;
  bio: string | null;
  photoUrl: string | null;
  linkedinUrl: string | null;
  isFeatured: boolean;
}

/**
 * Matches `TicketType` (app spec §9.2).
 * `perks` and `highlight` are UI-only.
 */
export interface PassTier {
  id: string;
  name: string;
  /** In INR. 0 = free. */
  price: number;
  description: string;
  perks: string[];
  isFreeForMnitOnly: boolean;
  highlight?: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SummitInfo {
  name: string;
  shortName: string;
  tagline: string;
  organizer: string;
  /** ISO dates, inclusive. */
  startDate: string;
  endDate: string;
  /** Pretty label for headers, e.g. "12–14 Feb 2027". */
  datesLabel: string;
  location: string;
  /** Result of `require()` on a local image. */
  logo: number;
  days: { day: SummitDay; date: string; label: string }[];
}
