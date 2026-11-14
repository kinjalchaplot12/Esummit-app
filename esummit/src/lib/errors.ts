/**
 * Typed API error class.
 * Non-2xx responses from the v1 backend are parsed into this.
 * Error codes match mobile-api-v1.md section 1.3.
 */
export class AppApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppApiError';
  }

  /** True when access token has expired (client triggers auto-refresh). */
  get isTokenExpired(): boolean {
    return this.code === 'TOKEN_EXPIRED';
  }

  /** True when token is invalid, missing, or revoked. */
  get isUnauthorized(): boolean {
    return this.statusCode === 401 || this.code === 'UNAUTHORIZED' || this.code === 'INVALID_TOKEN';
  }

  /** True when OTP is wrong or expired. */
  get isOtpInvalid(): boolean {
    return this.code === 'OTP_INVALID';
  }

  /** True when onboarding must be completed before performing action. */
  get isOnboardingRequired(): boolean {
    return this.code === 'ONBOARDING_REQUIRED';
  }

  /** True when rate limit is exceeded. */
  get isRateLimited(): boolean {
    return this.statusCode === 429 || this.code === 'RATE_LIMIT_EXCEEDED';
  }

  /** True when user is already registered for this event. */
  get isAlreadyRegistered(): boolean {
    return this.code === 'ALREADY_REGISTERED';
  }

  /** True when event capacity is full. */
  get isEventFull(): boolean {
    return this.code === 'EVENT_FULL';
  }

  /** True when event registration is closed or disabled. */
  get isRegistrationClosed(): boolean {
    return this.code === 'REGISTRATION_CLOSED';
  }

  /** True when this is the Google-only-account error needing "Set password". */
  get isGoogleOnlyAccount(): boolean {
    return this.code === 'GoogleOnlyAccount';
  }

  /** True when the account is blocked from deletion (editor/admin). */
  get isAccountBlocked(): boolean {
    return this.code === 'AccountBlocked' || (this.statusCode === 403 && this.code === 'FORBIDDEN');
  }

  /** True when email is not verified. */
  get isEmailUnverified(): boolean {
    return this.code === 'EmailUnverified' || this.code === 'UNVERIFIED_EMAIL';
  }
}

/**
 * Compares two semver strings (MAJOR.MINOR.PATCH).
 * Returns:
 *   -1  if a < b  (a is older)
 *    0  if a === b
 *    1  if a > b  (a is newer)
 *
 * Used by the forced-update logic in startup.
 */
export function compareSemver(a: string, b: string): -1 | 0 | 1 {
  const parse = (v: string): [number, number, number] => {
    const parts = v.replace(/[^0-9.]/g, '').split('.').map(Number);
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
  };

  const [aMaj, aMin, aPat] = parse(a);
  const [bMaj, bMin, bPat] = parse(b);

  if (aMaj !== bMaj) return aMaj < bMaj ? -1 : 1;
  if (aMin !== bMin) return aMin < bMin ? -1 : 1;
  if (aPat !== bPat) return aPat < bPat ? -1 : 1;
  return 0;
}

/**
 * Returns true if the running app version is below the minimum supported.
 * @param appVersion    The version string from ENV.APP_VERSION
 * @param minSupported  The minSupportedVersion* from AppConfig
 */
export function isUpdateRequired(appVersion: string, minSupported: string): boolean {
  return compareSemver(appVersion, minSupported) === -1;
}
