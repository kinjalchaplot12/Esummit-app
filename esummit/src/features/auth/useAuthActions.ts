/**
 * useAuthActions — what screens call to sign in / sign up.
 * Runs the active auth service, then puts the session into the auth store.
 */

import { useCallback, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authService, type AuthSession, type LoginInput, type SignupInput } from './authService';

export function useAuthActions() {
  const storeLogin = useAuthStore((s) => s.login);

  const start = useCallback(
    async (pending: Promise<AuthSession>) => {
      const { user, tokens } = await pending;
      await storeLogin(tokens, user);
      return user;
    },
    [storeLogin],
  );

  return useMemo(
    () => ({
      login: (input: LoginInput) => start(authService.login(input)),
      signup: (input: SignupInput) => start(authService.signup(input)),
      loginWithGoogle: () => start(authService.loginWithGoogle()),
    }),
    [start],
  );
}
