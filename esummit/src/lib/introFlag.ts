/**
 * First-launch flag for the intro slides. Not sensitive → AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'esummit_intro_seen';

export async function hasSeenIntro(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === '1';
  } catch {
    return true; // storage broken → don't trap the user in the intro
  }
}

export async function markIntroSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, '1');
  } catch {
    // Non-fatal: worst case the intro shows again next launch.
  }
}
