# E-Summit '27 — Mobile API v1 Developer Contract & Integration Guide

**Document Status:** Frozen v1 Contract Specification  
**Target Client:** React Native + Expo Mobile Application  
**Target Backend:** Dedicated Node.js / Express API Service (Shared PostgreSQL via Prisma 7 & Upstash Redis)  
**Date:** October 2026  
**Base URL (Production):** `https://api.esummit.ecellmnit.org/api/v1`  
**Base URL (Staging / Dev):** `https://api-dev.esummit.ecellmnit.org/api/v1` or `http://localhost:4000/api/v1`

---

## 1. Architecture Overview & Authentication Flow

### 1.1 Mobile Client Architecture
The mobile application is built using **React Native with Expo**. Because mobile applications cannot securely store shared client secrets or rely purely on cookie-based web sessions across varying mobile networking environments, the Mobile API v1 adopts standard **Bearer Token Authentication** using:
- **Short-Lived Access Tokens (JWT):** Signed by the backend, valid for **15 minutes**. Sent by the client in the `Authorization: Bearer <access_token>` header on all protected requests.
- **Long-Lived Refresh Tokens:** Cryptographically random, opaque string or token family with a **30-day lifetime**, used exclusively at `POST /api/v1/auth/token/refresh` to issue a new access token and rotated refresh token.
- **Secure Mobile Storage:** The Expo app must store tokens using `expo-secure-store` (backed by iOS Keychain and Android Keystore), never in unencrypted `AsyncStorage`.

### 1.2 Authentication Methods
Mobile users authenticate via either:
1. **Google Sign-In (`POST /api/v1/auth/google`):** The Expo app uses native Google Sign-In (`@react-native-google-signin/google-signin` or `expo-auth-session`) to obtain a Google OpenID Connect ID token (`idToken`), which is passed to the backend for cryptographic signature and audience verification.
2. **Email OTP Authentication (`POST /api/v1/auth/otp/send` & `POST /api/v1/auth/otp/verify`):** Passwordless 6-digit numeric One-Time Password sent to the user's email via AWS SES.

### 1.3 Standard Envelope Formats

#### Success Response Envelope (`HTTP 2xx`)
Every successful API response is wrapped in a consistent JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-17T12:00:00.000Z"
  }
}
```

#### Error Response Envelope (`HTTP 4xx / 5xx`)
Every error response is returned with standard HTTP status codes and a structured error object:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "The provided credentials or token are invalid.",
    "details": {}
  },
  "meta": {
    "timestamp": "2026-10-17T12:00:00.000Z"
  }
}
```

#### Common Error Codes
| HTTP Status | Error Code (`error.code`) | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_ERROR` | Request payload failed schema validation. Field issues listed in `details`. |
| `400 Bad Request` | `INVALID_REQUEST` | Malformed JSON or missing required query/body parameters. |
| `401 Unauthorized` | `UNAUTHORIZED` | Missing, expired, or malformed Bearer token. |
| `401 Unauthorized` | `TOKEN_EXPIRED` | Access token has expired; client must refresh. |
| `401 Unauthorized` | `INVALID_TOKEN` | Token signature invalid or token has been revoked. |
| `401 Unauthorized` | `OTP_INVALID` | Incorrect OTP entered or OTP has expired. |
| `403 Forbidden` | `FORBIDDEN` | Caller lacks the necessary role or permission. |
| `403 Forbidden` | `ONBOARDING_REQUIRED` | User must finish onboarding before performing this action. |
| `404 Not Found` | `NOT_FOUND` | Requested resource (e.g. event slug or user) does not exist. |
| `409 Conflict` | `ALREADY_REGISTERED` | User is already registered for this event. |
| `409 Conflict` | `EVENT_FULL` | Event has reached maximum capacity. |
| `409 Conflict` | `REGISTRATION_CLOSED` | Event registration is closed or not enabled. |
| `429 Too Many Requests`| `RATE_LIMIT_EXCEEDED` | Request rate limit exceeded. Check `Retry-After` header. |
| `500 Internal Error` | `INTERNAL_SERVER_ERROR`| Unhandled server error. Error details omitted in production. |

---

## 2. Shared Database Mapping & Models

The backend interacts with the shared PostgreSQL database via Prisma 7. The exact verified models in `prisma/schema.prisma` are:

### 2.1 Role Enum
```prisma
enum Role {
  STUDENT
  EDITOR
  ADMIN
}
```

### 2.2 RegistrationStatus Enum
```prisma
enum RegistrationStatus {
  NOT_STARTED
  OPEN
  CLOSED
}
```

### 2.3 User Model Mapping
```prisma
model User {
  id                     String    @id @default(cuid())
  email                  String    @unique
  emailVerified          DateTime?
  passwordHash           String?   // bcrypt - NEVER exposed via API
  name                   String
  gender                 String?
  phoneNumber            String?
  branch                 String?   // Maps to College / Institution in onboarding
  year                   Int?      // Maps to Age in onboarding
  hostelOrDayScholar     String?
  profilePhotoUrl        String?
  role                   Role      @default(STUDENT)
  onboardingCompleted    Boolean   @default(false)
  promotionalEmailsOptIn Boolean   @default(false)
  resendAudienceId       String?   // Internal marketing sync - NEVER exposed via API
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
}
```

### 2.4 Event Model Mapping
```prisma
model Event {
  id                   String             @id @default(cuid())
  title                String
  slug                 String             @unique
  description          String             @db.Text
  date                 DateTime
  location             String
  bannerImageUrl       String?
  registrationEnabled  Boolean            @default(false)
  registrationStatus   RegistrationStatus @default(NOT_STARTED)
  registrationOpensAt  DateTime?
  registrationClosesAt DateTime?
  capacity             Int?
  createdById          String
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
}
```

### 2.5 EventRegistration Model Mapping
```prisma
model EventRegistration {
  id           String   @id @default(cuid())
  eventId      String
  userId       String
  registeredAt DateTime @default(now())

  @@unique([eventId, userId])
}
```

---

## 3. Detailed Endpoint Specifications

### 3.1 Authentication Endpoints

#### 3.1.1 Google Sign-In
- **Endpoint:** `POST /api/v1/auth/google`
- **Description:** Authenticates or registers a user via a Google OpenID Connect ID token obtained natively on the mobile client. Verifies the Google token signature and audience, checks `email_verified === true`, safely links or creates the `User` and `Account` records, and returns JWT access and refresh tokens.
- **Authentication:** None (Public)
- **Headers:** `Content-Type: application/json`
- **Rate Limit:** 10 attempts per 5 minutes per IP.
- **Request Body:**
  ```json
  {
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
  }
  ```
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `idToken` | String | Yes | Google OpenID Connect JWT ID token. Must not be empty. |

- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "cm2u12345000008l0h9abcdef",
        "name": "Jane Doe",
        "email": "janedoe@gmail.com",
        "profilePhotoUrl": "https://lh3.googleusercontent.com/a/...",
        "role": "STUDENT",
        "onboardingCompleted": false
      },
      "tokens": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
        "expiresIn": 900,
        "tokenType": "Bearer",
        "refreshToken": "rf_7a8b9c0d1e2f3a4b5c6d7e8f"
      }
    },
    "meta": {
      "timestamp": "2026-10-17T12:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` (`VALIDATION_ERROR`): Missing `idToken`.
  - `401 Unauthorized` (`INVALID_TOKEN`): Google ID token is invalid, expired, or has an untrusted audience (`aud`).
  - `401 Unauthorized` (`UNVERIFIED_EMAIL`): Google account email has `email_verified === false`.
  - `429 Too Many Requests` (`RATE_LIMIT_EXCEEDED`): Rate limit exceeded.

---

#### 3.1.2 Request Email OTP
- **Endpoint:** `POST /api/v1/auth/otp/send`
- **Description:** Sends a 6-digit numeric One-Time Password to the specified email address for passwordless authentication. Validates email format, checks rate limits, generates a cryptographically secure 6-digit code with a 5-minute expiry, and dispatches the email via AWS SES.
- **Authentication:** None (Public)
- **Headers:** `Content-Type: application/json`
- **Rate Limit:** 1 request per 60 seconds per email, maximum 5 sends per hour per IP.
- **Request Body:**
  ```json
  {
    "email": "student@mnit.ac.in"
  }
  ```
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | String | Yes | Valid user email address. Normalized to lowercase. |

- **Success Response (`200 OK`):**
  *(To prevent user enumeration, always returns success even if account is new)*
  ```json
  {
    "success": true,
    "data": {
      "message": "If the email is valid, a 6-digit verification code has been dispatched.",
      "expiresInSeconds": 300,
      "resendAfterSeconds": 60
    },
    "meta": {
      "timestamp": "2026-10-17T12:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` (`VALIDATION_ERROR`): Invalid email format.
  - `429 Too Many Requests` (`RATE_LIMIT_EXCEEDED`): Too many OTP requests. Returns `Retry-After` header.

---

#### 3.1.3 Verify Email OTP
- **Endpoint:** `POST /api/v1/auth/otp/verify`
- **Description:** Verifies the 6-digit OTP code against the stored value. Upon successful verification, marks `emailVerified` on the user (creating the user record if new), consumes the OTP, and returns access and refresh tokens.
- **Authentication:** None (Public)
- **Headers:** `Content-Type: application/json`
- **Rate Limit:** 5 attempts per 15 minutes per email.
- **Request Body:**
  ```json
  {
    "email": "student@mnit.ac.in",
    "otp": "492817"
  }
  ```
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | String | Yes | User email address. |
  | `otp` | String | Yes | 6-digit numeric string (`/^[0-9]{6}$/`). |

- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "cm2u12345000008l0h9abcdef",
        "name": "Alex Sharma",
        "email": "student@mnit.ac.in",
        "profilePhotoUrl": null,
        "role": "STUDENT",
        "onboardingCompleted": false
      },
      "tokens": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
        "expiresIn": 900,
        "tokenType": "Bearer",
        "refreshToken": "rf_7a8b9c0d1e2f3a4b5c6d7e8f"
      }
    },
    "meta": {
      "timestamp": "2026-10-17T12:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` (`VALIDATION_ERROR`): Malformed email or non-6-digit OTP code.
  - `401 Unauthorized` (`OTP_INVALID`): OTP is incorrect, expired, or has exceeded attempt limits.
  - `429 Too Many Requests` (`RATE_LIMIT_EXCEEDED`): Maximum verification attempts reached.

---

#### 3.1.4 Refresh Access Token
- **Endpoint:** `POST /api/v1/auth/token/refresh`
- **Description:** Exchanges a valid refresh token for a fresh short-lived access token and a rotated refresh token. If a previously consumed or revoked refresh token is replayed, the backend revokes the entire token family.
- **Authentication:** None (Token in body)
- **Headers:** `Content-Type: application/json`
- **Rate Limit:** 30 requests per minute per IP.
- **Request Body:**
  ```json
  {
    "refreshToken": "rf_7a8b9c0d1e2f3a4b5c6d7e8f"
  }
  ```
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `refreshToken` | String | Yes | Active refresh token issued during login or last rotation. |

- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "expiresIn": 900,
      "tokenType": "Bearer",
      "refreshToken": "rf_9f8e7d6c5b4a3f2e1d0c9b8a"
    },
    "meta": {
      "timestamp": "2026-10-17T12:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` (`VALIDATION_ERROR`): Missing `refreshToken`.
  - `401 Unauthorized` (`INVALID_TOKEN`): Refresh token is invalid, expired, or revoked.

---

#### 3.1.5 Logout
- **Endpoint:** `POST /api/v1/auth/logout`
- **Description:** Revokes the provided refresh token and invalidates the active mobile session.
- **Authentication:** Bearer Token (`Authorization: Bearer <access_token>`)
- **Headers:** `Authorization: Bearer <access_token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "refreshToken": "rf_9f8e7d6c5b4a3f2e1d0c9b8a"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "message": "Successfully logged out. Session invalidated."
    },
    "meta": {
      "timestamp": "2026-10-17T12:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized` (`UNAUTHORIZED`): Missing or invalid access token.

---

### 3.2 User Endpoints

#### 3.2.1 Get Current User Profile
- **Endpoint:** `GET /api/v1/users/me`
- **Description:** Returns the authenticated user's profile and onboarding state.
- **Authentication:** Bearer Token (`Authorization: Bearer <access_token>`)
- **Headers:** `Authorization: Bearer <access_token>`
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "cm2u12345000008l0h9abcdef",
      "name": "Alex Sharma",
      "email": "student@mnit.ac.in",
      "emailVerified": "2026-10-17T11:45:00.000Z",
      "role": "STUDENT",
      "gender": "MALE",
      "phoneNumber": "+919876543210",
      "branch": "Computer Science and Engineering",
      "year": 3,
      "hostelOrDayScholar": "HOSTELER",
      "profilePhotoUrl": "https://d1234abcdef8.cloudfront.net/profile-photos/cm2u12345/avatar.webp",
      "onboardingCompleted": true,
      "promotionalEmailsOptIn": true,
      "createdAt": "2026-10-10T08:00:00.000Z",
      "updatedAt": "2026-10-17T11:45:00.000Z"
    },
    "meta": {
      "timestamp": "2026-10-17T12:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized` (`UNAUTHORIZED` / `TOKEN_EXPIRED`): Missing or expired token.
  - `404 Not Found` (`NOT_FOUND`): User record no longer exists.

---

### 3.3 Event Endpoints

#### 3.3.1 List Events
- **Endpoint:** `GET /api/v1/events`
- **Description:** Returns a list of public E-Summit events with optional filtering and pagination.
- **Authentication:** Optional (If authenticated, response includes `isRegistered: boolean` per event).
- **Query Parameters:**
  | Parameter | Type | Required | Default | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `status` | String | No | - | Filter by `RegistrationStatus` (`NOT_STARTED`, `OPEN`, `CLOSED`). |
  | `page` | Integer | No | `1` | Page number (1-indexed). |
  | `limit` | Integer | No | `20` | Items per page (max 50). |
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "events": [
        {
          "id": "cm2evt111000008l0h9abcdef",
          "title": "Hackathon 2027",
          "slug": "hackathon-2027",
          "description": "36-hour flagship hackathon of E-Summit '27.",
          "date": "2027-02-14T09:00:00.000Z",
          "location": "Central Lawn, MNIT Jaipur",
          "bannerImageUrl": "https://d1234abcdef8.cloudfront.net/events/hackathon.webp",
          "registrationEnabled": true,
          "registrationStatus": "OPEN",
          "registrationOpensAt": "2026-12-01T00:00:00.000Z",
          "registrationClosesAt": "2027-02-10T23:59:59.000Z",
          "capacity": 300,
          "registeredCount": 142,
          "isRegistered": false
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "totalItems": 1,
        "totalPages": 1,
        "hasNextPage": false
      }
    },
    "meta": {
      "timestamp": "2026-10-17T12:00:00.000Z"
    }
  }
  ```

---

#### 3.3.2 Get Single Event by Slug
- **Endpoint:** `GET /api/v1/events/{slug}`
- **Description:** Retrieves complete details for a single event identified by its unique URL slug.
- **Authentication:** Optional (If authenticated, returns `isRegistered: boolean` for the calling user).
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "cm2evt111000008l0h9abcdef",
      "title": "Hackathon 2027",
      "slug": "hackathon-2027",
      "description": "36-hour flagship hackathon of E-Summit '27.",
      "date": "2027-02-14T09:00:00.000Z",
      "location": "Central Lawn, MNIT Jaipur",
      "bannerImageUrl": "https://d1234abcdef8.cloudfront.net/events/hackathon.webp",
      "registrationEnabled": true,
      "registrationStatus": "OPEN",
      "registrationOpensAt": "2026-12-01T00:00:00.000Z",
      "registrationClosesAt": "2027-02-10T23:59:59.000Z",
      "capacity": 300,
      "registeredCount": 142,
      "isRegistered": false
    },
    "meta": {
      "timestamp": "2026-10-17T12:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `404 Not Found` (`NOT_FOUND`): No event found with the given slug.

---

#### 3.3.3 Register for Event
- **Endpoint:** `POST /api/v1/events/{slug}/register`
- **Description:** Registers the authenticated user for the event. Validates event availability (`registrationEnabled === true`, `registrationStatus === OPEN`, `now >= registrationOpensAt`, `now < registrationClosesAt`), verifies capacity constraints, creates `EventRegistration`, and triggers an email confirmation receipt via AWS SES.
- **Authentication:** Bearer Token (`Authorization: Bearer <access_token>`)
- **Headers:** `Authorization: Bearer <access_token>`
- **Rate Limit:** 5 registrations per minute per user.
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "registration": {
        "id": "cm2reg999000008l0h9abcdef",
        "eventId": "cm2evt111000008l0h9abcdef",
        "userId": "cm2u12345000008l0h9abcdef",
        "registeredAt": "2026-10-17T12:05:00.000Z"
      },
      "event": {
        "title": "Hackathon 2027",
        "slug": "hackathon-2027"
      }
    },
    "meta": {
      "timestamp": "2026-10-17T12:05:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized` (`UNAUTHORIZED`): Authentication required.
  - `403 Forbidden` (`ONBOARDING_REQUIRED`): User must complete onboarding before registering.
  - `404 Not Found` (`NOT_FOUND`): Event slug does not exist.
  - `409 Conflict` (`ALREADY_REGISTERED`): User has already registered for this event (`P2002`).
  - `409 Conflict` (`EVENT_FULL`): Event capacity limit has been reached.
  - `409 Conflict` (`REGISTRATION_CLOSED`): Event registration is closed or not enabled.

---

#### 3.3.4 Get User's Registration Status for Event
- **Endpoint:** `GET /api/v1/events/{slug}/registration`
- **Description:** Checks if the authenticated user is currently registered for the specified event and returns registration details.
- **Authentication:** Bearer Token (`Authorization: Bearer <access_token>`)
- **Headers:** `Authorization: Bearer <access_token>`
- **Success Response (`200 OK` - Registered):**
  ```json
  {
    "success": true,
    "data": {
      "isRegistered": true,
      "registration": {
        "id": "cm2reg999000008l0h9abcdef",
        "registeredAt": "2026-10-17T12:05:00.000Z"
      }
    },
    "meta": {
      "timestamp": "2026-10-17T12:00:00.000Z"
    }
  }
  ```
- **Success Response (`200 OK` - Not Registered):**
  ```json
  {
    "success": true,
    "data": {
      "isRegistered": false,
      "registration": null
    },
    "meta": {
      "timestamp": "2026-10-17T12:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized` (`UNAUTHORIZED`): Authentication required.
  - `404 Not Found` (`NOT_FOUND`): Event slug does not exist.

---

### 3.4 Admin Observability Endpoint (Proposed)

#### 3.4.1 Get Event Registrations & Participant Records
- **Endpoint:** `GET /api/v1/admin/events/{slug}/registrations`
- **Description:** Admin-only endpoint returning event registration metrics, total counts, remaining capacity, and paginated participant details. Never exposes sensitive fields such as `passwordHash` or `resendAudienceId`.
- **Authentication:** Bearer Token (`Authorization: Bearer <access_token>`) with `role: ADMIN` or `role: EDITOR`.
- **Query Parameters:**
  | Parameter | Type | Required | Default | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `page` | Integer | No | `1` | Page number (1-indexed). |
  | `limit` | Integer | No | `50` | Records per page (max 100). |
  | `search` | String | No | - | Filter participants by name or email substring. |
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "event": {
        "id": "cm2evt111000008l0h9abcdef",
        "title": "Hackathon 2027",
        "slug": "hackathon-2027",
        "capacity": 300,
        "totalRegistrations": 142,
        "remainingCapacity": 158
      },
      "participants": [
        {
          "registrationId": "cm2reg999000008l0h9abcdef",
          "registeredAt": "2026-10-17T12:05:00.000Z",
          "user": {
            "id": "cm2u12345000008l0h9abcdef",
            "name": "Alex Sharma",
            "email": "student@mnit.ac.in",
            "phoneNumber": "+919876543210",
            "branch": "Computer Science and Engineering",
            "year": 3,
            "hostelOrDayScholar": "HOSTELER"
          }
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 50,
        "totalItems": 142,
        "totalPages": 3,
        "hasNextPage": true
      }
    },
    "meta": {
      "timestamp": "2026-10-17T12:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized` (`UNAUTHORIZED`): Authentication required.
  - `403 Forbidden` (`FORBIDDEN`): Caller role is `STUDENT`. Requires `EDITOR` or `ADMIN`.
  - `404 Not Found` (`NOT_FOUND`): Event not found.

---

## 4. Unresolved Technical & Business Decisions

The following architectural decisions are flagged for confirmation by project leadership. Recommended defaults are provided, but business rules must not be finalized without team agreement:

### 4.1 Google ID-Token Audience & Client IDs
- **Problem:** The web application currently validates Google OAuth via `GOOGLE_CLIENT_ID` (Web Client). Native Android and iOS Expo applications often generate ID tokens with platform-specific client IDs (`GOOGLE_ANDROID_CLIENT_ID` and `GOOGLE_IOS_CLIENT_ID`) or a shared Expo OAuth client ID.
- **Decision Required:** Should the backend accept an array of allowed client IDs for `aud` validation (`[GOOGLE_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID]`)?
- **Recommended Default:** Yes. Support a comma-delimited environment variable `GOOGLE_ALLOWED_CLIENT_IDS` so tokens issued on Web, Android, and iOS all pass signature and audience checks cleanly.

### 4.2 OTP Storage, TTL, and Security
- **Problem:** The current PostgreSQL schema contains `EmailVerificationToken` (intended for 24-hour web magic links with bcrypt hashing). Numeric 6-digit OTPs require rapid verification, rate-limited attempts, and 5-minute auto-expiry.
- **Decision Required:** Should mobile OTPs be stored in Redis (Upstash) with a 300-second TTL and max 3-5 attempt counter, or should a new table (`MobileOtpToken`) be created in PostgreSQL?
- **Recommended Default:** Use Upstash Redis key `otp:<email>` with JSON `{ codeHash, attempts, expiresAt }` and a 300s TTL. This avoids database bloat and provides atomic attempt increments.

### 4.3 Refresh Token Strategy & Session Invalidation
- **Problem:** The website uses NextAuth database sessions in the `Session` table. Mobile apps need token rotation and immediate revocation upon logout or security events.
- **Decision Required:** Should mobile refresh tokens be stored as records in a new PostgreSQL table (`RefreshToken`), or stored in Redis, or mapped to the existing `Session` table?
- **Recommended Default:** Store refresh tokens in Redis or a dedicated table with token family IDs to support automatic token rotation and replay-attack detection (revoking all tokens if an old token is reused).

### 4.4 Onboarding Enforcement Policy
- **Problem:** Web middleware redirects un-onboarded users (`onboardingCompleted === false`) to `/onboarding`.
- **Decision Required:** How should mobile endpoints handle users with `onboardingCompleted === false`? Should all endpoints block until an onboarding endpoint is completed, or should onboarding be optional on mobile?
- **Recommended Default:** Allow profile inspection (`GET /api/v1/users/me`), but require onboarding before event registration (`POST /api/v1/events/{slug}/register` returns `403 ONBOARDING_REQUIRED`).

### 4.5 Registration Concurrency & Capacity Locking
- **Problem:** With 15,000–20,000 concurrent users attempting to register for limited-capacity events, reading registration counts before inserting can cause race conditions (overselling).
- **Decision Required:** What concurrency control mechanism should be used for event capacity?
- **Recommended Default:** Execute registrations inside a PostgreSQL transaction using `SELECT capacity FROM "Event" WHERE id = $1 FOR UPDATE` to lock the event row during capacity evaluation, or manage an atomic decrement counter in Redis.

### 4.6 Field Naming Compatibility (`year` & `branch`)
- **Problem:** In the web database, `User.year` stores age (integer) and `User.branch` stores institution/college (string).
- **Decision Required:** Should the v1 mobile API normalize these fields to `college` and `age`, or keep `branch` and `year`?
- **Recommended Default:** Return both in v1 responses (e.g. `branch: "MNIT Jaipur"`, `college: "MNIT Jaipur"`) to provide clean semantics for mobile developers without breaking backward compatibility.

### 4.7 Separate Express API Hosting Architecture
- **Problem:** The Next.js 16 container hosts the website on AWS ECS Fargate. The mobile API is proposed to run as an independent Express backend.
- **Decision Required:** Will the Express backend be deployed as a separate ECS Fargate task service behind the same Application Load Balancer under path `/api/v1/*`, or on a distinct subdomain (`api.esummit.ecellmnit.org`)?
- **Recommended Default:** Host on `api.esummit.ecellmnit.org` or route `/api/v1/*` at the ALB to the Express target group. Both services share the same AWS RDS database and Upstash Redis instance.

---

## 5. Mobile Developer Quick-Start Checklist

1. **Install Storage & Auth Libraries in Expo:**
   ```bash
   npx expo install expo-secure-store expo-crypto
   ```
2. **Configure Google Sign-In:**
   - Configure iOS Client ID and Android Client ID in Google Cloud Console.
   - Use Google Sign-In SDK to obtain `idToken`.
   - Send `idToken` to `POST /api/v1/auth/google`.
3. **Handle Token Refresh in Axios / Fetch Interceptor:**
   - On HTTP `401 TOKEN_EXPIRED`, intercept request, call `POST /api/v1/auth/token/refresh` with stored `refreshToken`.
   - Update `accessToken` and `refreshToken` in `expo-secure-store`.
   - Retry failed request with new access token.
   - If refresh fails, clear secure store and redirect to login screen.
4. **Rate Limiting Handling:**
   - Inspect `Retry-After` header on HTTP `429` responses and display user-friendly countdown timer.
