/**
 * Auth service — the one seam between the UI and whatever does authentication.
 *
 * Screens never talk to the backend directly for auth. They call
 * `useAuthActions()` (./useAuthActions.ts), which calls the active
 * `authService` below and then stores the result in the Zustand auth store.
 *
 * Plugging in the real backend later:
 *   1. Write `apiAuthService` implementing `AuthService` (call `api.*` from
 *      src/api/client.ts, return `{ user, tokens }`).
 *   2. Point `authService` (bottom of this file) at it.
 *   No screen needs to change.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../../lib/schemas';
import type { TokenPair } from '../../lib/secureStorage';

// ─── Contract ─────────────────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput extends LoginInput {
  name: string;
  college: string;
}

export interface AuthSession {
  user: User;
  tokens: TokenPair;
}

export interface AuthService {
  login(input: LoginInput): Promise<AuthSession>;
  signup(input: SignupInput): Promise<AuthSession>;
  loginWithGoogle(): Promise<AuthSession>;
  /** Called once on app boot. Returns the signed-in user, or null. */
  restoreSession(): Promise<User | null>;
  logout(): Promise<void>;
}

// ─── Fake implementation (no backend) ─────────────────────────────────────────

/** Fake user is not sensitive, so AsyncStorage is fine. Real tokens go to SecureStore. */
const FAKE_USER_KEY = 'esummit_fake_user';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function makeDummyUser(email: string, name?: string, college?: string): User {
  const now = new Date().toISOString();
  return {
    id: `fake-${Date.now()}`,
    name: name?.trim() || email.split('@')[0] || 'Guest',
    email,
    emailVerified: now,
    role: 'STUDENT',
    college: college?.trim() || null,
    branch: college?.trim() || null,
    onboardingCompleted: true,
    promotionalEmailsOptIn: false,
    createdAt: now,
    updatedAt: now,
  };
}

async function startFakeSession(user: User): Promise<AuthSession> {
  await wait(700); // feel like a network call
  await AsyncStorage.setItem(FAKE_USER_KEY, JSON.stringify(user));
  return { user, tokens: { accessToken: 'fake-access-token', refreshToken: 'fake-refresh-token' } };
}

export const fakeAuthService: AuthService = {
  login: ({ email }) => startFakeSession(makeDummyUser(email)),

  signup: ({ email, name, college }) => startFakeSession(makeDummyUser(email, name, college)),

  loginWithGoogle: () => startFakeSession(makeDummyUser('google.user@example.com', 'Google User')),

  restoreSession: async () => {
    try {
      const raw = await AsyncStorage.getItem(FAKE_USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(FAKE_USER_KEY);
  },
};

// ─── Active implementation ────────────────────────────────────────────────────

/**
 * TODO(auth): swap for an `apiAuthService` once the backend exposes
 * email+password login/signup. Until then every build uses the fake.
 */
export const authService: AuthService = fakeAuthService;
