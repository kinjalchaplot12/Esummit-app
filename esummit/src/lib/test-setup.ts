/**
 * Jest test setup file.
 * Configures test environment mocks for React Native and Expo packages.
 */

// Silence noisy console warnings in tests if needed
// Mock SecureStore
jest.mock('expo-secure-store', () => {
  let store: Record<string, string> = {};
  return {
    setItemAsync: jest.fn(async (key: string, val: string) => {
      store[key] = val;
    }),
    getItemAsync: jest.fn(async (key: string) => store[key] ?? null),
    deleteItemAsync: jest.fn(async (key: string) => {
      delete store[key];
    }),
    __clearStore: () => {
      store = {};
    },
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    setItem: jest.fn(async (key: string, val: string) => {
      store[key] = val;
    }),
    getItem: jest.fn(async (key: string) => store[key] ?? null),
    removeItem: jest.fn(async (key: string) => {
      delete store[key];
    }),
    clear: jest.fn(async () => {
      store = {};
    }),
  };
});
