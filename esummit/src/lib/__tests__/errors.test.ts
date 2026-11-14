/**
 * Unit tests for error handling and semver version comparison logic.
 *
 * Covers:
 * - AppApiError typed status codes, codes, and helper getters
 * - compareSemver logic across major, minor, and patch numbers
 * - isUpdateRequired gate logic for forced-update startup check
 */

import { AppApiError, compareSemver, isUpdateRequired } from '../errors';

describe('AppApiError', () => {
  it('correctly sets statusCode, code, and message', () => {
    const error = new AppApiError(401, 'InvalidCredentials', 'Invalid email or password');
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('InvalidCredentials');
    expect(error.message).toBe('Invalid email or password');
    expect(error.name).toBe('AppApiError');
  });

  it('correctly identifies GoogleOnlyAccount error', () => {
    const error = new AppApiError(400, 'GoogleOnlyAccount', 'Account created with Google');
    expect(error.isGoogleOnlyAccount).toBe(true);
    expect(error.isAccountBlocked).toBe(false);
  });

  it('correctly identifies AccountBlocked error', () => {
    const error = new AppApiError(403, 'AccountBlocked', 'Admins cannot delete their accounts');
    expect(error.isAccountBlocked).toBe(true);
    expect(error.isGoogleOnlyAccount).toBe(false);
  });

  it('correctly identifies EmailUnverified error', () => {
    const error = new AppApiError(403, 'EmailUnverified', 'Please verify your email');
    expect(error.isEmailUnverified).toBe(true);
  });
});

describe('compareSemver', () => {
  it('returns 0 when versions are identical', () => {
    expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
    expect(compareSemver('2.4.12', '2.4.12')).toBe(0);
  });

  it('returns -1 when first version is older by major', () => {
    expect(compareSemver('1.0.0', '2.0.0')).toBe(-1);
  });

  it('returns 1 when first version is newer by major', () => {
    expect(compareSemver('2.0.0', '1.9.9')).toBe(1);
  });

  it('returns -1 when first version is older by minor', () => {
    expect(compareSemver('1.2.0', '1.3.0')).toBe(-1);
  });

  it('returns 1 when first version is newer by minor', () => {
    expect(compareSemver('1.3.0', '1.2.9')).toBe(1);
  });

  it('returns -1 when first version is older by patch', () => {
    expect(compareSemver('1.0.1', '1.0.2')).toBe(-1);
  });

  it('returns 1 when first version is newer by patch', () => {
    expect(compareSemver('1.0.5', '1.0.4')).toBe(1);
  });

  it('handles irregular versions with non-numeric suffixes', () => {
    expect(compareSemver('v1.0.0', '1.0.0')).toBe(0);
    expect(compareSemver('1.0.0-beta', '1.0.1')).toBe(-1);
  });
});

describe('isUpdateRequired', () => {
  it('requires update if current version is lower than minSupported', () => {
    expect(isUpdateRequired('1.0.0', '1.1.0')).toBe(true);
    expect(isUpdateRequired('1.0.5', '2.0.0')).toBe(true);
  });

  it('does NOT require update if current version equals minSupported', () => {
    expect(isUpdateRequired('1.1.0', '1.1.0')).toBe(false);
    expect(isUpdateRequired('2.0.0', '2.0.0')).toBe(false);
  });

  it('does NOT require update if current version is newer than minSupported', () => {
    expect(isUpdateRequired('1.2.0', '1.1.0')).toBe(false);
    expect(isUpdateRequired('3.0.0', '2.5.0')).toBe(false);
  });
});
