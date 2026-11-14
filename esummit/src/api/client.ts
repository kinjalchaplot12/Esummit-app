/**
 * API client — single module for all HTTP communication with the v1 backend.
 *
 * Implements Mobile API v1 (openapi-v1.yaml & mobile-api-v1.md):
 * - Standard Success Envelope unwrapping: { success: true, data: T, meta }
 * - Standard Error Envelope parsing into AppApiError: { success: false, error: { code, message, details } }
 * - Attaches Authorization: Bearer <accessToken>, X-App-Version, X-Platform headers.
 * - Automatic silent token refresh on 401 TOKEN_EXPIRED using stored refreshToken.
 * - On terminal 401: clears session and triggers unauthorized listener.
 * - When USE_MOCK_API is true, intercepted by src/mocks.
 */

import { Platform } from 'react-native';
import { z } from 'zod';
import ENV from '../config/env';
import { AppApiError } from '../lib/errors';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from '../lib/secureStorage';
import { mockHandlers, type MockHandlerKey } from '../mocks/handlers';

import {
  AppConfigSchema,
  UserSchema,
  AuthSuccessDataSchema,
  AuthTokensSchema,
  SendOtpResponseDataSchema,
  MessageResponseSchema,
  EventSchema,
  EventListResponseDataSchema,
  EventRegistrationSuccessDataSchema,
  UserRegistrationStatusDataSchema,
  type AppConfig,
  type User,
  type AuthSuccessData,
  type AuthTokens,
  type SendOtpResponseData,
  type MessageResponse,
  type Event,
  type EventListResponseData,
  type EventRegistrationSuccessData,
  type UserRegistrationStatusData,
  type OnboardingCompletePayload,
  type ProfileUpdatePayload,
} from '../lib/schemas';

// ─── 401 Event Bus ────────────────────────────────────────────────────────────
// Auth store listens to this to clear user state on authentication failure.
type UnauthorizedListener = () => void;
const unauthorizedListeners: Set<UnauthorizedListener> = new Set();

export function onUnauthorized(fn: UnauthorizedListener): () => void {
  unauthorizedListeners.add(fn);
  return () => unauthorizedListeners.delete(fn);
}

function emitUnauthorized(): void {
  unauthorizedListeners.forEach((fn) => fn());
}

// ─── Core fetch wrapper with silent refresh ───────────────────────────────────

interface RequestOptions {
  method?:     'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?:       unknown | FormData;
  token?:      string | null;
  isFormData?: boolean;
  _isRetry?:   boolean;
}

let isRefreshing = false;
let refreshSubscribers: Array<(newToken: string | null) => void> = [];

function onTokenRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function apiFetch<T>(
  path: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, isFormData = false, _isRetry = false } = options;

  // ── Mock path ──────────────────────────────────────────────────────────
  if (ENV.USE_MOCK_API) {
    // Normalise parametric route keys for mock lookup (e.g. /events/hackathon-2027 -> /events/:slug)
    let handlerKey = `${method} ${path}`;
    if (!mockHandlers[handlerKey as MockHandlerKey]) {
      if (path.startsWith('/events/') && path.endsWith('/register')) {
        handlerKey = `${method} /events/:slug/register`;
      } else if (path.startsWith('/events/') && path.endsWith('/registration')) {
        handlerKey = `${method} /events/:slug/registration`;
      } else if (path.startsWith('/events/')) {
        handlerKey = `${method} /events/:slug`;
      }
    }

    const handler = mockHandlers[handlerKey as MockHandlerKey];
    if (!handler) {
      throw new AppApiError(404, 'MockNotFound', `No mock handler for ${method} ${path}`);
    }

    try {
      const result = await (handler as unknown as (b: unknown, p?: string) => Promise<unknown>)(body ?? {}, path);
      return schema.parse(result);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'statusCode' in err) {
        const e = err as { statusCode: number; code: string; message: string; details?: Record<string, unknown> };
        if (e.statusCode === 401 && e.code !== 'INVALID_CREDENTIALS' && e.code !== 'OTP_INVALID') {
          emitUnauthorized();
        }
        throw new AppApiError(e.statusCode, e.code, e.message, e.details);
      }
      if (err instanceof z.ZodError) {
        throw new AppApiError(0, 'SchemaValidation', err.message);
      }
      throw err;
    }
  }

  // ── Real HTTP path ─────────────────────────────────────────────────────
  const token = options.token ?? (await getAccessToken());
  const headers: Record<string, string> = {
    'X-App-Version': ENV.APP_VERSION,
    'X-Platform':    Platform.OS,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${ENV.API_BASE_URL}${path}`;
  const response = await fetch(url, {
    method,
    headers,
    body: isFormData
      ? (body as FormData)
      : body !== undefined
      ? JSON.stringify(body)
      : undefined,
  });

  // Handle Token Expiry & Silent Refresh (mobile-api-v1.md §5.3)
  if (response.status === 401 && !_isRetry) {
    let errorCode = 'UNAUTHORIZED';
    try {
      const errJson = await response.clone().json();
      errorCode = errJson?.error?.code ?? errJson?.code ?? 'UNAUTHORIZED';
    } catch {
      // Body not JSON
    }

    if (errorCode === 'TOKEN_EXPIRED') {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const storedRefreshToken = await getRefreshToken();
          if (!storedRefreshToken) throw new Error('No refresh token available');

          const refreshRes = await fetch(`${ENV.API_BASE_URL}/auth/token/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
          });

          if (!refreshRes.ok) throw new Error('Refresh request failed');

          const refreshJson = await refreshRes.json();
          const tokens = AuthTokensSchema.parse(refreshJson.data ?? refreshJson);
          await saveTokens({
            accessToken:  tokens.accessToken,
            refreshToken: tokens.refreshToken,
          });

          isRefreshing = false;
          onTokenRefreshed(tokens.accessToken);

          // Retry original request
          return apiFetch(path, schema, { ...options, _isRetry: true, token: tokens.accessToken });
        } catch {
          isRefreshing = false;
          onTokenRefreshed(null);
          await clearTokens();
          emitUnauthorized();
          throw new AppApiError(401, 'UNAUTHORIZED', 'Session expired. Please log in again.');
        }
      } else {
        // Wait for active refresh to complete
        return new Promise<T>((resolve, reject) => {
          refreshSubscribers.push((newToken) => {
            if (newToken) {
              resolve(apiFetch(path, schema, { ...options, _isRetry: true, token: newToken }));
            } else {
              reject(new AppApiError(401, 'UNAUTHORIZED', 'Session expired. Please log in again.'));
            }
          });
        });
      }
    }

    // Terminal 401 (invalid credentials, revoked session)
    await clearTokens();
    emitUnauthorized();
    throw new AppApiError(401, errorCode, 'Session expired or unauthorized.');
  }

  const json = await response.json();

  if (!response.ok) {
    const errorObj = json?.error ?? json;
    const code     = typeof errorObj?.code === 'string' ? errorObj.code : 'UNKNOWN_ERROR';
    const message  = typeof errorObj?.message === 'string'
      ? errorObj.message
      : typeof errorObj?.error === 'string'
      ? errorObj.error
      : 'An unexpected server error occurred.';
    const details  = errorObj?.details;
    throw new AppApiError(response.status, code, message, details);
  }

  // Unwrap v1 standard envelope if present: { success: true, data: T, meta: ... }
  const dataToValidate = json?.success === true && 'data' in json ? json.data : json;

  try {
    return schema.parse(dataToValidate);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      throw new AppApiError(0, 'SchemaValidation', `Response schema mismatch: ${err.message}`);
    }
    throw err;
  }
}

// ─── Typed API Surface (Mobile API v1) ────────────────────────────────────────

export const api = {
  // ── 1. Startup & Config ────────────────────────────────────────────────────
  getConfig: (): Promise<AppConfig> =>
    apiFetch('/config', AppConfigSchema),

  // ── 2. Authentication (mobile-api-v1.md §3.1) ──────────────────────────────
  loginWithGoogle: (body: { idToken: string }): Promise<AuthSuccessData> =>
    apiFetch('/auth/google', AuthSuccessDataSchema, { method: 'POST', body }),

  sendOtp: (body: { email: string }): Promise<SendOtpResponseData> =>
    apiFetch('/auth/otp/send', SendOtpResponseDataSchema, { method: 'POST', body }),

  verifyOtp: (body: { email: string; otp: string }): Promise<AuthSuccessData> =>
    apiFetch('/auth/otp/verify', AuthSuccessDataSchema, { method: 'POST', body }),

  refreshToken: (body: { refreshToken: string }): Promise<AuthTokens> =>
    apiFetch('/auth/token/refresh', AuthTokensSchema, { method: 'POST', body }),

  logout: (body?: { refreshToken?: string }): Promise<MessageResponse> =>
    apiFetch('/auth/logout', MessageResponseSchema, { method: 'POST', body: body ?? {} }),

  // ── 3. Users (mobile-api-v1.md §3.2) ───────────────────────────────────────
  getMe: (): Promise<User> =>
    apiFetch('/users/me', UserSchema),

  // ── 4. Events & Registrations (mobile-api-v1.md §3.3) ──────────────────────
  listEvents: (params?: {
    status?: 'NOT_STARTED' | 'OPEN' | 'CLOSED';
    page?: number;
    limit?: number;
  }): Promise<EventListResponseData> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page)   query.append('page', String(params.page));
    if (params?.limit)  query.append('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiFetch(`/events${qs}`, EventListResponseDataSchema);
  },

  getEventBySlug: (slug: string): Promise<Event> =>
    apiFetch(`/events/${slug}`, EventSchema),

  registerForEvent: (slug: string): Promise<EventRegistrationSuccessData> =>
    apiFetch(`/events/${slug}/register`, EventRegistrationSuccessDataSchema, { method: 'POST' }),

  getEventRegistration: (slug: string): Promise<UserRegistrationStatusData> =>
    apiFetch(`/events/${slug}/registration`, UserRegistrationStatusDataSchema),

  // ── 5. Compatibility Surface (Phase 3 App Shell UI) ────────────────────────
  login: (body: { email: string; password?: string }): Promise<AuthSuccessData> =>
    apiFetch('/auth/login', AuthSuccessDataSchema, { method: 'POST', body }),

  signup: (body: { name: string; email: string; password?: string }): Promise<AuthSuccessData> =>
    apiFetch('/auth/signup', AuthSuccessDataSchema, { method: 'POST', body }),

  loginWithApple: (body?: { identityToken?: string; nonce?: string }): Promise<AuthSuccessData> =>
    apiFetch('/auth/apple', AuthSuccessDataSchema, { method: 'POST', body: body ?? {} }),

  resendVerification: (): Promise<MessageResponse> =>
    apiFetch('/auth/resend-verification', MessageResponseSchema, { method: 'POST' }),

  forgotPassword: (body: { email: string }): Promise<MessageResponse> =>
    apiFetch('/auth/forgot-password', MessageResponseSchema, { method: 'POST', body }),

  requestSetPassword: (body: { email: string }): Promise<MessageResponse> =>
    apiFetch('/auth/request-set-password', MessageResponseSchema, { method: 'POST', body }),

  logoutAll: (): Promise<MessageResponse> =>
    apiFetch('/auth/logout-all', MessageResponseSchema, { method: 'POST' }),

  completeOnboarding: (body: OnboardingCompletePayload): Promise<User> =>
    apiFetch('/onboarding/complete', UserSchema, { method: 'POST', body }),

  updateProfile: (body: ProfileUpdatePayload): Promise<User> =>
    apiFetch('/profile', UserSchema, { method: 'PATCH', body }),

  uploadProfilePhoto: (formData: FormData): Promise<{ profilePhotoUrl: string }> =>
    apiFetch(
      '/profile/photo',
      z.object({ profilePhotoUrl: z.string() }),
      { method: 'POST', body: formData, isFormData: true },
    ),

  deleteAccount: (body: { password?: string }): Promise<MessageResponse> =>
    apiFetch('/account/delete', MessageResponseSchema, { method: 'POST', body }),
};
