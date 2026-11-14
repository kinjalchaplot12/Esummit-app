/**
 * Secure token storage — Keychain (iOS) / Keystore (Android).
 *
 * Requirements (mobile-api-v1.md §1.1):
 * - Short-lived Access Token (15 min JWT)
 * - Long-lived Refresh Token (30-day token rotation)
 * - NEVER use AsyncStorage for bearer tokens.
 * - NEVER log tokens.
 */

import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY  = 'esummit_access_token';
const REFRESH_TOKEN_KEY = 'esummit_refresh_token';

export interface TokenPair {
  accessToken:  string;
  refreshToken: string;
}

/** Persist both access and refresh tokens. */
export async function saveTokens(tokens: TokenPair): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

/** Retrieve the current access token. */
export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

/** Retrieve the current refresh token. */
export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

/** Remove all stored tokens upon logout. */
export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

// ─── Backward compatibility aliases ──────────────────────────────────────────
export const saveToken  = async (token: string): Promise<void> =>
  SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);

export const getToken   = getAccessToken;
export const clearToken = clearTokens;
