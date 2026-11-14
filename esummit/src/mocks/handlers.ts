/**
 * Mock API handlers — realistic data with artificial network latency.
 * Aligned with Mobile API v1 (openapi-v1.yaml & mobile-api-v1.md).
 *
 * When ENV.USE_MOCK_API is true, client.ts intercepts calls and routes here.
 * Set ENV.USE_MOCK_API to false to point directly to the live backend.
 */

import type {
  AppConfig,
  AuthSuccessData,
  AuthTokens,
  Event,
  EventListResponseData,
  EventRegistrationSuccessData,
  SendOtpResponseData,
  User,
  UserRegistrationStatusData,
} from '../lib/schemas';

// ─── Tunable delay ────────────────────────────────────────────────────────────

const DELAY_MS = 450;
const delay = (ms = DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const createMeta = () => ({
  timestamp: new Date().toISOString(),
});

// ─── Static mock data ─────────────────────────────────────────────────────────

export const MOCK_APP_CONFIG: AppConfig = {
  minSupportedVersionIos:     '1.0.0',
  minSupportedVersionAndroid: '1.0.0',
  latestVersionIos:           '1.0.0',
  latestVersionAndroid:       '1.0.0',
  maintenanceMode:            false,
  maintenanceMessage:         null,
  iosStoreUrl:     'https://apps.apple.com/app/esummit/PLACEHOLDER',
  androidStoreUrl: 'https://play.google.com/store/apps/details?id=org.ecellmnit.esummit',
  offlinePackTtlHours: 24,
  features: {
    kitSystemEnabled:   true,
    caApplicationsOpen: true,
    idSubmissionOpen:   true,
  },
};

export const MOCK_REGULAR_USER: User = {
  id:                     'cm2u12345000008l0h9abcdef',
  email:                  'student@mnit.ac.in',
  name:                   'Aarav Sharma',
  emailVerified:          '2026-10-17T11:45:00.000Z',
  role:                   'STUDENT',
  gender:                 'MALE',
  phoneNumber:            '+919876543210',
  branch:                 'Computer Science and Engineering',
  year:                   3,
  hostelOrDayScholar:     'HOSTELER',
  profilePhotoUrl:        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  onboardingCompleted:    true,
  promotionalEmailsOptIn: true,
  college:                'MNIT Jaipur',
  roles:                  ['STUDENT'],
  features: {
    scanner: false,
  },
  notificationPreferences: {
    eventReminders: true,
    announcements:  true,
    liveUpdates:    true,
    ticketUpdates:  true,
  },
  createdAt:              '2026-10-10T08:00:00.000Z',
  updatedAt:              '2026-10-17T11:45:00.000Z',
};

export const MOCK_SCANNER_USER: User = {
  ...MOCK_REGULAR_USER,
  id:       'cm2u99999000008l0h9admin',
  name:     'Priya Volunteer',
  email:    'organizer@mnit.ac.in',
  role:     'ADMIN',
  roles:    ['ADMIN'],
  features: {
    scanner: true, // Enables the 6th Scan tab
  },
};

export const MOCK_UNVERIFIED_USER: User = {
  ...MOCK_REGULAR_USER,
  id:                  'cm2u00000000008l0h9newbie',
  email:               'newdelegate@mnit.ac.in',
  emailVerified:       null,
  name:                'New Delegate',
  onboardingCompleted: false,
};

export const MOCK_EVENTS: Event[] = [
  {
    id:                   'cm2evt111000008l0h9abcdef',
    title:                'Hackathon 2027',
    slug:                 'hackathon-2027',
    description:          '36-hour flagship hackathon of E-Summit with mentorship from top founders and prizes worth 5 Lakhs.',
    date:                 '2027-02-14T09:00:00.000Z',
    location:             'Central Lawn, MNIT Jaipur',
    bannerImageUrl:       'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    registrationEnabled:  true,
    registrationStatus:   'OPEN',
    registrationOpensAt:  '2026-12-01T00:00:00.000Z',
    registrationClosesAt: '2027-02-10T23:59:59.000Z',
    capacity:             300,
    registeredCount:      142,
    isRegistered:         false,
  },
  {
    id:                   'cm2evt222000008l0h9abcdef',
    title:                'Founders Panel & Keynote',
    slug:                 'founders-panel-2027',
    description:          'Fireside chat with unicorns and seed investors discussing venture capital and deeptech innovation.',
    date:                 '2027-02-15T11:00:00.000Z',
    location:             'Main Auditorium (Prabha Bhawan)',
    bannerImageUrl:       'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    registrationEnabled:  true,
    registrationStatus:   'OPEN',
    registrationOpensAt:  '2026-12-01T00:00:00.000Z',
    registrationClosesAt: '2027-02-14T18:00:00.000Z',
    capacity:             800,
    registeredCount:      620,
    isRegistered:         true,
  },
  {
    id:                   'cm2evt333000008l0h9abcdef',
    title:                'E-Auction Challenge',
    slug:                 'e-auction-challenge',
    description:          'Strategy and negotiation challenge where teams bid for startup assets and intellectual property.',
    date:                 '2027-02-15T14:30:00.000Z',
    location:             'VLTC Room L008',
    bannerImageUrl:       'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    registrationEnabled:  true,
    registrationStatus:   'CLOSED',
    registrationOpensAt:  '2026-12-01T00:00:00.000Z',
    registrationClosesAt: '2027-02-01T23:59:59.000Z',
    capacity:             100,
    registeredCount:      100,
    isRegistered:         false,
  },
];

// ─── Active mock session state ───────────────────────────────────────────────

let _mockUser: User = MOCK_REGULAR_USER;
let _mockAccessToken: string | null = 'mock_jwt_access_token_' + Date.now();
let _mockRefreshToken: string | null = 'rf_' + Math.random().toString(36).slice(2);
const _registeredEventSlugs = new Set<string>(['founders-panel-2027']);

// ─── Mock Handlers Dictionary ────────────────────────────────────────────────

export const mockHandlers = {
  // ── 1. Startup & Config ────────────────────────────────────────────────────
  'GET /config': async (): Promise<AppConfig> => {
    await delay();
    return MOCK_APP_CONFIG;
  },

  // ── 2. v1 Auth: Google Sign-In (mobile-api-v1.md §3.1.1) ───────────────────
  'POST /auth/google': async (_body: { idToken: string }): Promise<AuthSuccessData> => {
    await delay();
    _mockAccessToken = 'mock_jwt_access_' + Math.random().toString(36).slice(2);
    _mockRefreshToken = 'rf_' + Math.random().toString(36).slice(2);
    _mockUser = { ...MOCK_REGULAR_USER };

    return {
      user: {
        id:                  _mockUser.id,
        name:                _mockUser.name,
        email:               _mockUser.email,
        profilePhotoUrl:     _mockUser.profilePhotoUrl,
        role:                _mockUser.role,
        onboardingCompleted: _mockUser.onboardingCompleted,
      },
      tokens: {
        accessToken:  _mockAccessToken,
        expiresIn:    900,
        tokenType:    'Bearer',
        refreshToken: _mockRefreshToken,
      },
    };
  },

  // ── 3. v1 Auth: Email OTP Send (mobile-api-v1.md §3.1.2) ───────────────────
  'POST /auth/otp/send': async (_body: { email: string }): Promise<SendOtpResponseData> => {
    await delay();
    return {
      message:            'If the email is valid, a 6-digit verification code has been dispatched.',
      expiresInSeconds:   300,
      resendAfterSeconds: 60,
    };
  },

  // ── 4. v1 Auth: Email OTP Verify (mobile-api-v1.md §3.1.3) ─────────────────
  'POST /auth/otp/verify': async (body: { email: string; otp: string }): Promise<AuthSuccessData> => {
    await delay();
    if (body.otp === '000000') {
      throw {
        statusCode: 401,
        code:       'OTP_INVALID',
        message:    'Incorrect or expired verification code.',
      };
    }

    _mockAccessToken = 'mock_jwt_access_' + Math.random().toString(36).slice(2);
    _mockRefreshToken = 'rf_' + Math.random().toString(36).slice(2);
    _mockUser = { ...MOCK_REGULAR_USER, email: body.email };

    return {
      user: {
        id:                  _mockUser.id,
        name:                _mockUser.name,
        email:               _mockUser.email,
        profilePhotoUrl:     _mockUser.profilePhotoUrl,
        role:                _mockUser.role,
        onboardingCompleted: _mockUser.onboardingCompleted,
      },
      tokens: {
        accessToken:  _mockAccessToken,
        expiresIn:    900,
        tokenType:    'Bearer',
        refreshToken: _mockRefreshToken,
      },
    };
  },

  // ── 5. v1 Auth: Token Refresh (mobile-api-v1.md §3.1.4) ────────────────────
  'POST /auth/token/refresh': async (body: { refreshToken: string }): Promise<AuthTokens> => {
    await delay(200);
    if (!body.refreshToken || body.refreshToken.includes('invalid')) {
      throw {
        statusCode: 401,
        code:       'INVALID_TOKEN',
        message:    'Refresh token is invalid or has expired.',
      };
    }

    _mockAccessToken = 'mock_jwt_access_refreshed_' + Math.random().toString(36).slice(2);
    _mockRefreshToken = 'rf_rotated_' + Math.random().toString(36).slice(2);

    return {
      accessToken:  _mockAccessToken,
      expiresIn:    900,
      tokenType:    'Bearer',
      refreshToken: _mockRefreshToken,
    };
  },

  // ── 6. v1 Auth: Logout (mobile-api-v1.md §3.1.5) ───────────────────────────
  'POST /auth/logout': async (_body: { refreshToken?: string }): Promise<{ message: string }> => {
    await delay(150);
    _mockAccessToken = null;
    _mockRefreshToken = null;
    return { message: 'Successfully logged out. Session invalidated.' };
  },

  // ── 7. v1 User: Current Profile (mobile-api-v1.md §3.2.1) ──────────────────
  'GET /users/me': async (): Promise<User> => {
    await delay(200);
    if (!_mockAccessToken) {
      throw {
        statusCode: 401,
        code:       'UNAUTHORIZED',
        message:    'Missing or invalid authorization token.',
      };
    }
    return _mockUser;
  },

  // ── 8. v1 Events: List Events (mobile-api-v1.md §3.3.1) ────────────────────
  'GET /events': async (): Promise<EventListResponseData> => {
    await delay(300);
    const events = MOCK_EVENTS.map((e) => ({
      ...e,
      isRegistered: _registeredEventSlugs.has(e.slug),
    }));

    return {
      events,
      pagination: {
        page:        1,
        limit:       20,
        totalItems:  events.length,
        totalPages:  1,
        hasNextPage: false,
      },
    };
  },

  // ── 9. v1 Events: Get Single Event (mobile-api-v1.md §3.3.2) ───────────────
  'GET /events/:slug': async (_body: unknown, path?: string): Promise<Event> => {
    await delay(250);
    const slug = path?.split('/').pop() ?? 'hackathon-2027';
    const found = MOCK_EVENTS.find((e) => e.slug === slug) ?? MOCK_EVENTS[0]!;
    return {
      ...found,
      isRegistered: _registeredEventSlugs.has(found.slug),
    };
  },

  // ── 10. v1 Events: Register for Event (mobile-api-v1.md §3.3.3) ────────────
  'POST /events/:slug/register': async (_body: unknown, path?: string): Promise<EventRegistrationSuccessData> => {
    await delay(400);
    if (!_mockAccessToken) {
      throw { statusCode: 401, code: 'UNAUTHORIZED', message: 'Authentication required.' };
    }
    if (!_mockUser.onboardingCompleted) {
      throw { statusCode: 403, code: 'ONBOARDING_REQUIRED', message: 'Please complete your onboarding profile first.' };
    }

    const slug = path?.split('/')[2] ?? 'hackathon-2027';
    if (_registeredEventSlugs.has(slug)) {
      throw { statusCode: 409, code: 'ALREADY_REGISTERED', message: 'You have already registered for this event.' };
    }

    _registeredEventSlugs.add(slug);
    const found = MOCK_EVENTS.find((e) => e.slug === slug) ?? MOCK_EVENTS[0]!;

    return {
      registration: {
        id:           'cm2reg' + Math.random().toString(36).slice(2),
        eventId:      found.id,
        userId:       _mockUser.id,
        registeredAt: new Date().toISOString(),
      },
      event: {
        title: found.title,
        slug:  found.slug,
      },
    };
  },

  // ── 11. v1 Events: Get Registration Status (mobile-api-v1.md §3.3.4) ───────
  'GET /events/:slug/registration': async (_body: unknown, path?: string): Promise<UserRegistrationStatusData> => {
    await delay(200);
    const slug = path?.split('/')[2] ?? 'hackathon-2027';
    const isReg = _registeredEventSlugs.has(slug);

    return {
      isRegistered: isReg,
      registration: isReg
        ? {
            id:           'cm2reg' + Math.random().toString(36).slice(2),
            registeredAt: '2026-10-17T12:05:00.000Z',
          }
        : null,
    };
  },

  // ── 12. Compatibility Handlers for Phase 3 UI Screens ──────────────────────
  'POST /auth/login': async (body: { email: string; password?: string }): Promise<AuthSuccessData> => {
    await delay();
    if (body.password === 'wrong') {
      throw { statusCode: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' };
    }
    _mockAccessToken = 'mock_jwt_access_' + Math.random().toString(36).slice(2);
    _mockRefreshToken = 'rf_' + Math.random().toString(36).slice(2);
    _mockUser = { ...MOCK_REGULAR_USER, email: body.email };

    return {
      user: {
        id:                  _mockUser.id,
        name:                _mockUser.name,
        email:               _mockUser.email,
        profilePhotoUrl:     _mockUser.profilePhotoUrl,
        role:                _mockUser.role,
        onboardingCompleted: _mockUser.onboardingCompleted,
      },
      tokens: {
        accessToken:  _mockAccessToken,
        expiresIn:    900,
        tokenType:    'Bearer',
        refreshToken: _mockRefreshToken,
      },
    };
  },

  'POST /auth/signup': async (body: { name: string; email: string; password?: string }): Promise<AuthSuccessData> => {
    await delay();
    _mockAccessToken = 'mock_jwt_access_' + Math.random().toString(36).slice(2);
    _mockRefreshToken = 'rf_' + Math.random().toString(36).slice(2);
    _mockUser = {
      ...MOCK_UNVERIFIED_USER,
      name:  body.name,
      email: body.email,
    };

    return {
      user: {
        id:                  _mockUser.id,
        name:                _mockUser.name,
        email:               _mockUser.email,
        profilePhotoUrl:     _mockUser.profilePhotoUrl,
        role:                _mockUser.role,
        onboardingCompleted: _mockUser.onboardingCompleted,
      },
      tokens: {
        accessToken:  _mockAccessToken,
        expiresIn:    900,
        tokenType:    'Bearer',
        refreshToken: _mockRefreshToken,
      },
    };
  },

  'POST /auth/apple': async (): Promise<AuthSuccessData> => {
    await delay();
    _mockAccessToken = 'mock_jwt_apple_' + Math.random().toString(36).slice(2);
    _mockRefreshToken = 'rf_apple_' + Math.random().toString(36).slice(2);
    _mockUser = { ...MOCK_REGULAR_USER };

    return {
      user: {
        id:                  _mockUser.id,
        name:                _mockUser.name,
        email:               _mockUser.email,
        profilePhotoUrl:     _mockUser.profilePhotoUrl,
        role:                _mockUser.role,
        onboardingCompleted: _mockUser.onboardingCompleted,
      },
      tokens: {
        accessToken:  _mockAccessToken,
        expiresIn:    900,
        tokenType:    'Bearer',
        refreshToken: _mockRefreshToken,
      },
    };
  },

  'POST /auth/resend-verification': async (): Promise<{ message: string }> => {
    await delay();
    return { message: 'Verification email sent. Check your inbox.' };
  },

  'POST /auth/forgot-password': async (): Promise<{ message: string }> => {
    await delay();
    return { message: 'If an account exists for that email, a reset link has been sent.' };
  },

  'POST /auth/request-set-password': async (): Promise<{ message: string }> => {
    await delay();
    return { message: 'A link to set your password has been sent to your email.' };
  },

  'POST /auth/logout-all': async (): Promise<{ message: string }> => {
    await delay(300);
    _mockAccessToken = null;
    _mockRefreshToken = null;
    return { message: 'All sessions terminated.' };
  },

  'GET /me': async (): Promise<User> => {
    await delay(200);
    return _mockUser;
  },

  'POST /onboarding/complete': async (body: {
    name: string;
    gender: string;
    phoneNumber: string;
    college: string;
  }): Promise<User> => {
    await delay();
    _mockUser = {
      ..._mockUser,
      name:                body.name,
      gender:              body.gender as User['gender'],
      phoneNumber:         body.phoneNumber,
      branch:              body.college,
      college:             body.college,
      emailVerified:       _mockUser.emailVerified ?? new Date().toISOString(),
      onboardingCompleted: true,
    };
    return _mockUser;
  },

  'PATCH /profile': async (body: Partial<User>): Promise<User> => {
    await delay();
    _mockUser = { ..._mockUser, ...body };
    return _mockUser;
  },

  'POST /profile/photo': async (_body: FormData): Promise<{ profilePhotoUrl: string }> => {
    await delay(800);
    const url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
    _mockUser = { ..._mockUser, profilePhotoUrl: url };
    return { profilePhotoUrl: url };
  },

  'POST /account/delete': async (body: { password?: string }): Promise<{ message: string }> => {
    await delay(600);
    if (body.password === 'editor') {
      throw {
        statusCode: 403,
        code:       'FORBIDDEN',
        message:    'Account cannot be deleted because you hold an administrative or editor role.',
      };
    }
    _mockAccessToken = null;
    _mockRefreshToken = null;
    _mockUser = MOCK_REGULAR_USER;
    return { message: 'Account deleted successfully.' };
  },
} as const;

export type MockHandlerKey = keyof typeof mockHandlers;
