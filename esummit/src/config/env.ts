// Environment configuration — the ONE place to change API settings.
// To switch from mock to real API: set USE_MOCK_API to false.
// To point at a different server: change API_BASE_URL.
// NEVER put secrets, DB URLs, or AWS keys here.

const ENV = {
  // ─── API ──────────────────────────────────────────────────────────────
  /**
   * Base URL for the Mobile API v1.
   * Production: 'https://api.esummit.ecellmnit.org/api/v1'
   * Staging:    'https://api-dev.esummit.ecellmnit.org/api/v1'
   * Local Dev:  'http://localhost:4000/api/v1'
   */
  API_BASE_URL: 'https://api.esummit.ecellmnit.org/api/v1',

  /**
   * When true, all API calls are intercepted by the mock layer in
   * src/mocks and never reach the network.
   * Toggle this to false when connecting to the live backend.
   */
  USE_MOCK_API: true,

  // ─── App identity ─────────────────────────────────────────────────────
  /** Semver string sent in X-App-Version on every request. */
  APP_VERSION: '1.0.0',

  // ─── OAuth — these are PUBLIC by design (not secrets) ─────────────────
  /**
   * Google OAuth client IDs. These are safe to ship in the app bundle.
   * Replace placeholders with real values from Google Cloud Console.
   */
  GOOGLE_IOS_CLIENT_ID:
    'PLACEHOLDER_GOOGLE_IOS_CLIENT_ID.apps.googleusercontent.com',
  GOOGLE_ANDROID_CLIENT_ID:
    'PLACEHOLDER_GOOGLE_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  GOOGLE_WEB_CLIENT_ID:
    'PLACEHOLDER_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',

  // ─── Crash reporting ──────────────────────────────────────────────────
  /**
   * Sentry Data Source Name. Public — it is safe in the bundle.
   * Replace placeholder with the real DSN from sentry.io.
   */
  SENTRY_DSN: 'PLACEHOLDER_SENTRY_DSN',

  // ─── Universal links ──────────────────────────────────────────────────
  UNIVERSAL_LINK_DOMAIN: 'esummit.ecellmnit.org',
} as const;

export default ENV;
