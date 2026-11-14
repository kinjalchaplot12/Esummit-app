/**
 * Unit tests for API client:
 * - Mock API invocation and Zod schema validation
 * - v1 Auth: Google, OTP Send/Verify, Token Refresh, Logout
 * - v1 Events: List, Get by Slug, Register, Registration Status
 * - Error parsing into AppApiError
 * - 401 unauthorized event bus triggering
 */

import { api, onUnauthorized } from '../client';
import { AppApiError } from '../../lib/errors';

describe('API Client (Mobile API v1)', () => {
  describe('Config & Startup', () => {
    it('successfully fetches AppConfig matching schema', async () => {
      const config = await api.getConfig();
      expect(config).toBeDefined();
      expect(typeof config.minSupportedVersionAndroid).toBe('string');
      expect(typeof config.maintenanceMode).toBe('boolean');
      expect(typeof config.features.kitSystemEnabled).toBe('boolean');
    });
  });

  describe('v1 Authentication Endpoints', () => {
    it('authenticates with Google ID token', async () => {
      const res = await api.loginWithGoogle({ idToken: 'test_token' });
      expect(res.tokens.accessToken).toBeDefined();
      expect(res.tokens.refreshToken).toBeDefined();
      expect(res.user.role).toBe('STUDENT');
    });

    it('sends email OTP successfully', async () => {
      const res = await api.sendOtp({ email: 'student@mnit.ac.in' });
      expect(res.message).toBeDefined();
      expect(res.expiresInSeconds).toBe(300);
      expect(res.resendAfterSeconds).toBe(60);
    });

    it('verifies valid 6-digit OTP', async () => {
      const res = await api.verifyOtp({ email: 'student@mnit.ac.in', otp: '123456' });
      expect(res.tokens.accessToken).toBeDefined();
      expect(res.tokens.refreshToken).toBeDefined();
      expect(res.user.email).toBe('student@mnit.ac.in');
    });

    it('rejects invalid OTP with AppApiError (OTP_INVALID)', async () => {
      await expect(
        api.verifyOtp({ email: 'student@mnit.ac.in', otp: '000000' })
      ).rejects.toThrow(AppApiError);

      try {
        await api.verifyOtp({ email: 'student@mnit.ac.in', otp: '000000' });
      } catch (err) {
        expect(err).toBeInstanceOf(AppApiError);
        const e = err as AppApiError;
        expect(e.isOtpInvalid).toBe(true);
        expect(e.statusCode).toBe(401);
      }
    });

    it('refreshes token pair using active refresh token', async () => {
      const tokens = await api.refreshToken({ refreshToken: 'rf_active_test' });
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.tokenType).toBe('Bearer');
    });

    it('logs out and revokes active session', async () => {
      const res = await api.logout({ refreshToken: 'rf_active_test' });
      expect(res.message).toContain('logged out');
    });
  });

  describe('v1 Events Endpoints', () => {
    it('retrieves paginated event list', async () => {
      const res = await api.listEvents();
      expect(res.events.length).toBeGreaterThan(0);
      expect(res.pagination.page).toBe(1);
      expect(res.events[0]?.title).toBe('Hackathon 2027');
    });

    it('retrieves a single event by slug', async () => {
      const event = await api.getEventBySlug('hackathon-2027');
      expect(event.slug).toBe('hackathon-2027');
      expect(event.registrationStatus).toBe('OPEN');
    });

    it('checks event registration status', async () => {
      const res = await api.getEventRegistration('founders-panel-2027');
      expect(typeof res.isRegistered).toBe('boolean');
    });
  });

  describe('401 Unauthorized handling', () => {
    it('notifies registered listeners on terminal 401', async () => {
      const listener = jest.fn();
      const unsubscribe = onUnauthorized(listener);

      try {
        await api.refreshToken({ refreshToken: 'invalid_token' });
      } catch {
        // Expected error
      }

      expect(listener).toHaveBeenCalled();

      // Test unsubscribe
      unsubscribe();
      listener.mockClear();

      try {
        await api.refreshToken({ refreshToken: 'invalid_token' });
      } catch {
        // Expected error
      }

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
