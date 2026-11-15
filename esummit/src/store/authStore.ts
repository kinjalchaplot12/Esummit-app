/**
 * Auth store (Zustand) — single source of truth for auth state.
 *
 * Responsibilities:
 * - Hold current User object in memory.
 * - Listen for 401 events from the API client and auto-clear state.
 * - Persist nothing sensitive to dev tools; tokens live only in SecureStore.
 */

import { create } from 'zustand';
import type { User, UserSummary } from '../lib/schemas';
import { saveToken, saveTokens, clearTokens } from '../lib/secureStorage';
import { onUnauthorized } from '../api/client';
import { authService } from '../features/auth/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean; // true while restoring session on boot

  // Actions
  setUser: (user: User) => void;
  login: (
    tokenOrTokens: string | { accessToken: string; refreshToken: string },
    user: User | UserSummary,
  ) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Register for 401 events from the API client
  onUnauthorized(() => {
    clearTokens().catch(() => undefined);
    set({ user: null, isLoading: false });
  });

  return {
    user:      null,
    isLoading: true, // starts true; cleared after session restore attempt

    setUser: (user) => set({ user }),

    login: async (tokenOrTokens, userSummaryOrFull) => {
      if (typeof tokenOrTokens === 'string') {
        await saveToken(tokenOrTokens);
      } else {
        await saveTokens(tokenOrTokens);
      }

      // Ensure minimal User shape is satisfied even if UserSummary is passed
      const fullUser: User = {
        ...userSummaryOrFull,
        emailVerified: (userSummaryOrFull as User).emailVerified ?? null,
        promotionalEmailsOptIn: (userSummaryOrFull as User).promotionalEmailsOptIn ?? false,
      };

      set({ user: fullUser, isLoading: false });
    },

    logout: async () => {
      await Promise.all([clearTokens(), authService.logout().catch(() => undefined)]);
      set({ user: null });
    },

    setLoading: (v) => set({ isLoading: v }),
  };
});

// ─── Selectors (avoid re-renders on unrelated changes) ───────────────────────
export const selectUser           = (s: AuthState) => s.user;
export const selectIsLoading      = (s: AuthState) => s.isLoading;
export const selectIsLoggedIn     = (s: AuthState) => s.user !== null;
export const selectHasScanner     = (s: AuthState) =>
  s.user?.role === 'ADMIN' || s.user?.role === 'EDITOR' || s.user?.features?.scanner === true;
export const selectOnboardingDone = (s: AuthState) => s.user?.onboardingCompleted === true;
export const selectEmailVerified  = (s: AuthState) => !!s.user?.emailVerified;
