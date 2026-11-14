/**
 * App config store (Zustand) — caches the last good AppConfig so the
 * app works offline. Config is fetched once on startup and on foreground.
 *
 * Storage: AsyncStorage is fine for non-sensitive config (not a token).
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppConfig } from '../lib/schemas';

const STORAGE_KEY = 'esummit_app_config';

interface ConfigState {
  config: AppConfig | null;
  loadedAt: number | null; // epoch ms

  setConfig: (config: AppConfig) => Promise<void>;
  loadCached: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config:   null,
  loadedAt: null,

  setConfig: async (config) => {
    set({ config, loadedAt: Date.now() });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ config, loadedAt: Date.now() }));
    } catch {
      // Storage write failure is non-fatal
    }
  },

  loadCached: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { config: AppConfig; loadedAt: number };
      set({ config: parsed.config, loadedAt: parsed.loadedAt });
    } catch {
      // Corrupt cache is non-fatal
    }
  },
}));
