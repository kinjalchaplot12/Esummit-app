# E-Summit Mobile App (React Native / Expo)

The official mobile application for **E-Summit**, MNIT Jaipur (organised by E-Cell).

---

## 📱 Phase 3 Overview (App Shell)

This codebase contains **Phase 3: The App Shell**, providing the foundational architecture, navigation system, theme tokens, authentication flows, mock API layer, and secure storage for subsequent phases.

- **Stack**: Expo (managed workflow, EAS-ready), React Native, TypeScript (strict mode), Expo Router.
- **State & Data**: TanStack Query (server state), Zustand (in-memory client auth & cached config).
- **Secure Token Storage**: `expo-secure-store` (iOS Keychain / Android Keystore). Auth tokens **never** go to AsyncStorage or client logs.
- **Iconography & Styling**: Lucide icons (`lucide-react-native`), Vanilla React Native StyleSheet with unified theme tokens in `src/theme`. No emojis used in UI.
- **Form & API Validation**: Zod (`zod`). Every API response and form payload is strictly validated.

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm / yarn / pnpm / bun
- Expo Go app on mobile device OR Android Studio / Xcode simulator

### Installation

```bash
# Navigate to project directory
cd esummit

# Install dependencies
npm install
```

### Running the App

```bash
# Start Expo development server
npm start

# Run on Android emulator / connected device
npm run android

# Run on iOS simulator (macOS required)
npm run ios

# Run in Web browser
npm run web
```

### Running Unit Tests

```bash
# Run Jest test suite (password validation, error parsing, 401 handling, version check)
npm test
```

### Linting & Formatting

```bash
# Check code with ESLint
npm run lint

# Format code with Prettier
npm run format
```

---

## 🔄 Toggling the Mock API

The app is built against a full mock layer mimicking all Phase 3 endpoints with realistic network delays.

To switch between the **Mock API** and the **Real HTTP API**:

Open `src/config/env.ts`:

```typescript
const ENV = {
  // Set to false to talk to the real server
  USE_MOCK_API: true, // <-- Change to false for live backend

  // Base URL for the real API
  API_BASE_URL: 'https://esummit.ecellmnit.org/api/app/v1',
  ...
};
```

### Testing Special States in the Mock Layer

In `src/mocks/handlers.ts`:
- **Testing the 6th "Scan" tab**: Change `let _mockUser: User = MOCK_REGULAR_USER;` to `MOCK_SCANNER_USER`. When `user.features.scanner === true`, the Scan tab dynamically appears in the bottom bar.
- **Testing unverified email state**: Change `_mockUser` to `MOCK_UNVERIFIED_USER`.
- **Testing maintenance mode**: Change `maintenanceMode: false` to `true` in `MOCK_APP_CONFIG`.
- **Testing forced app update**: Change `minSupportedVersionAndroid` or `minSupportedVersionIos` in `MOCK_APP_CONFIG` to `'2.0.0'`.

---

## 📂 Project Architecture

```
esummit/
├── app/                             # Expo Router file-based routes
│   ├── _layout.tsx                  # Root layout: font loader, query client, session restore, splash
│   ├── startup.tsx                  # Maintenance & forced-update gating screens
│   ├── +not-found.tsx               # 404 fallback route
│   ├── (tabs)/                      # Fixed bottom tab navigator (Spec §3.1)
│   │   ├── _layout.tsx              # Tab bar definition (5 fixed tabs + dynamic Scan tab)
│   │   ├── index.tsx                # Home tab (SDUI Phase 4 placeholder)
│   │   ├── events.tsx               # Events tab (Phase 5 placeholder)
│   │   ├── map.tsx                  # Campus Map tab (Phase 6 placeholder)
│   │   ├── my-pass.tsx              # My Pass tab (Phase 7 placeholder, auth gated)
│   │   ├── more.tsx                 # More tab (SDUI Phase 4 placeholder + profile row)
│   │   └── scan.tsx                 # Scanner tab (Phase 9 placeholder, role gated)
│   └── (auth)/                      # Auth stack routes (Spec §5)
│       ├── _layout.tsx              # Auth stack navigator
│       ├── welcome.tsx              # Welcome screen with brand hero & quick CTAs
│       ├── login.tsx                # Email/pass login, Google/Apple, GoogleOnlyAccount handler
│       ├── signup.tsx               # Registration with live password rule indicators
│       ├── forgot-password.tsx      # Password reset link dispatch (external web link)
│       ├── verify-pending.tsx       # Pending verification notice & resend action
│       ├── onboarding.tsx           # Dynamic profile completion form (Spec gap G1)
│       └── profile.tsx              # Profile editing, photo upload, notification toggles, logout, delete
├── src/
│   ├── api/
│   │   ├── client.ts                # Unified HTTP/mock client with headers, Zod parse, 401 bus
│   │   └── __tests__/               # API client test suite (401 listener, mock validation)
│   ├── components/                  # Reusable UI component library (Spec §3.3)
│   │   ├── Button.tsx               # Animated button (primary, secondary, text, danger)
│   │   ├── TextField.tsx            # Input with animated focus, error, and password reveal
│   │   ├── Screen.tsx               # Safe-area and keyboard-aware screen wrapper
│   │   ├── LoadingState.tsx         # Centered loading spinner
│   │   ├── EmptyState.tsx           # Empty list/state indicator
│   │   ├── ErrorState.tsx           # Error state with retry action
│   │   ├── Divider.tsx              # Themed divider line
│   │   └── index.ts                 # Barrel exports
│   ├── config/
│   │   └── env.ts                   # Central environment config (API URL, USE_MOCK_API, client IDs)
│   ├── features/
│   │   └── auth/
│   │       └── onboardingFields.ts  # Single source of truth for onboarding fields (Gap G1)
│   ├── lib/
│   │   ├── errors.ts                # AppApiError typed class & semver compare functions
│   │   ├── schemas.ts               # Complete Zod schemas matching spec §8 and §9
│   │   ├── secureStorage.ts         # expo-secure-store wrapper for JWT bearer token
│   │   ├── test-setup.ts            # Jest mock setup for storage and native modules
│   │   └── __tests__/               # Unit tests for password validation & error utilities
│   ├── mocks/
│   │   └── handlers.ts              # Mock handlers for all 15 Phase 3 API endpoints
│   ├── store/
│   │   ├── authStore.ts             # Zustand store for user session + 401 auto-logout
│   │   └── configStore.ts           # Zustand store caching AppConfig in AsyncStorage
│   └── theme/
│       └── index.ts                 # Design tokens (colors, typography, spacing, radii, durations)
├── babel.config.js                  # Babel presets and reanimated plugin
├── .eslintrc.js                     # ESLint configuration
├── .prettierrc                      # Prettier code formatting rules
└── package.json                     # Project manifest and scripts
```

---

## 📋 Architectural Assumptions & Decisions

1. **Spec Gap G1 (Onboarding Fields)**: As noted in spec section 7.11 and the gap register, the final onboarding schema is pending. The form is constructed purely dynamically from `src/features/auth/onboardingFields.ts`. Modifying that single file updates labels, types, options, and placeholders across the app without touching UI screens.
2. **Password Validation (Spec §5.3)**: Required: 8 to 128 characters, at least one uppercase letter, at least one lowercase letter, at least one digit. Implemented via Zod `PasswordSchema` and validated both client-side and in mock signup.
3. **Google-Only Account Handling**: If a user registered with Google attempts password login, the backend responds with `code: 'GoogleOnlyAccount'`. The login screen recognizes this and presents an immediate action calling `POST /auth/request-set-password`.
4. **Photo Upload Constraint**: Photo upload size limit is 8 MB on the server. The profile screen utilizes `expo-image-manipulator` to crop (1:1 aspect) and compress JPEG to ~600x600 px before constructing multipart form-data.
5. **Account Deletion Safeguard**: To prevent unauthorized deletion, user must re-enter their password. If the backend responds with `code: 'AccountBlocked'` (e.g. user holds `ADMIN` or `EDITOR` role), the app displays a clear explanation that admin accounts cannot be deleted directly.
6. **Guest Browsing**: Guest users can access Home, Events, Map, and More tabs without logging in. Navigating to My Pass or Profile presents a prominent prompt directing them to Log in or Sign up.

---

## 🔍 Status Summary & Next Phase Requirements

### What is Completed in Phase 3
- Full Expo Router directory structure with bottom tabs and auth stack.
- Complete dark theme token system (`src/theme`) and custom reusable component library (`Button`, `TextField`, `Screen`, `EmptyState`, etc.).
- Complete mock API layer with 15 realistic handlers with latency and state switches.
- Startup configuration check supporting Maintenance mode and forced minimum version upgrades.
- Complete authentication flow: Welcome, Login, Signup, Forgot Password, Pending Email Verification, Onboarding, Profile.
- Secure token persistence in Keychain / Keystore via `expo-secure-store`.
- Profile photo picking, cropping, and device-side compression.
- Unit test suites covering password rules, version comparisons, and API error/401 handling.

### What is Placeholder (Reserved for Future Phases)
- **Home Tab**: SDUI root container (Phase 4).
- **Events Tab**: Event categories, list, and details (Phase 5).
- **Map Tab**: Interactive campus map & POI list (Phase 6).
- **My Pass Tab**: Dynamic QR pass generation, offline pass caching, accommodation status (Phase 7).
- **Scan Tab**: Camera scanner for QR check-in & kit distribution (Phase 9).
- **More Tab**: SDUI-driven LinkList menu (Phase 4).

### Next Phase Requirements from Backend
- Live deployment of `https://esummit.ecellmnit.org/api/app/v1/*` endpoints.
- Confirmation of Google Cloud OAuth Web, iOS, and Android client IDs.
- Final resolution on onboarding field naming schema (Spec gap G1).
- SDUI schema definitions for `/pages/home` and `/pages/more`.
