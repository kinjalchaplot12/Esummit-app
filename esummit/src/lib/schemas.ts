/**
 * Zod schemas aligned with Mobile API v1 (openapi-v1.yaml & mobile-api-v1.md).
 * Every API response and form payload is validated against these schemas.
 */

import { z } from 'zod';

// ─── 1. Standard Envelopes & Meta ─────────────────────────────────────────────

export const ResponseMetaSchema = z.object({
  timestamp: z.string(),
});
export type ResponseMeta = z.infer<typeof ResponseMetaSchema>;

export const ErrorObjectSchema = z.object({
  code:    z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});
export type ErrorObject = z.infer<typeof ErrorObjectSchema>;

export const EnvelopeErrorSchema = z.object({
  success: z.literal(false),
  error:   ErrorObjectSchema,
  meta:    ResponseMetaSchema,
});
export type EnvelopeError = z.infer<typeof EnvelopeErrorSchema>;

/** Generic wrapper for successful v1 envelope responses. */
export function createEnvelopeSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data:    dataSchema,
    meta:    ResponseMetaSchema,
  });
}

// ─── 2. Roles & User Models (Prisma 7 verified) ──────────────────────────────

export const RoleSchema = z.enum(['STUDENT', 'EDITOR', 'ADMIN']);
export type Role = z.infer<typeof RoleSchema>;

export const GenderSchema = z.enum([
  'MALE',
  'FEMALE',
  'NON_BINARY',
  'PREFER_NOT_TO_SAY',
]);
export type Gender = z.infer<typeof GenderSchema>;

/** Compact user summary returned on login/OTP verification. */
export const UserSummarySchema = z.object({
  id:                  z.string(),
  name:                z.string(),
  email:               z.string().email(),
  profilePhotoUrl:     z.string().nullable().optional(),
  role:                RoleSchema,
  onboardingCompleted: z.boolean(),
});
export type UserSummary = z.infer<typeof UserSummarySchema>;

/** Full User profile returned from GET /users/me. */
export const UserSchema = z.object({
  id:                     z.string(),
  name:                   z.string(),
  email:                  z.string().email(),
  emailVerified:          z.string().nullable().optional(),
  role:                   RoleSchema,
  gender:                 z.string().nullable().optional(),
  phoneNumber:            z.string().nullable().optional(),
  branch:                 z.string().nullable().optional(), // Maps to College / Institution in onboarding
  year:                   z.number().nullable().optional(), // Maps to Age in onboarding
  hostelOrDayScholar:     z.string().nullable().optional(),
  profilePhotoUrl:        z.string().nullable().optional(),
  onboardingCompleted:    z.boolean(),
  promotionalEmailsOptIn: z.boolean().default(false),
  createdAt:              z.string().optional(),
  updatedAt:              z.string().optional(),
  // Compatibility fields for mobile UI helpers
  college:                z.string().nullable().optional(),
  roles:                  z.array(RoleSchema).optional(),
  features: z.object({
    scanner: z.boolean(),
  }).optional(),
  notificationPreferences: z.object({
    eventReminders: z.boolean().default(true),
    announcements:  z.boolean().default(true),
    liveUpdates:    z.boolean().default(true),
    ticketUpdates:  z.boolean().default(true),
  }).optional(),
});
export type User = z.infer<typeof UserSchema>;

// ─── 3. Auth Tokens & Payloads ───────────────────────────────────────────────

export const AuthTokensSchema = z.object({
  accessToken:  z.string(),
  expiresIn:    z.number(),
  tokenType:    z.string().default('Bearer'),
  refreshToken: z.string(),
});
export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export const AuthSuccessDataSchema = z.object({
  user:   UserSummarySchema,
  tokens: AuthTokensSchema,
});
export type AuthSuccessData = z.infer<typeof AuthSuccessDataSchema>;

export const GoogleLoginPayloadSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});
export type GoogleLoginPayload = z.infer<typeof GoogleLoginPayloadSchema>;

export const SendOtpPayloadSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
export type SendOtpPayload = z.infer<typeof SendOtpPayloadSchema>;

export const SendOtpResponseDataSchema = z.object({
  message:            z.string(),
  expiresInSeconds:   z.number(),
  resendAfterSeconds: z.number(),
});
export type SendOtpResponseData = z.infer<typeof SendOtpResponseDataSchema>;

export const VerifyOtpPayloadSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp:   z.string().regex(/^[0-9]{6}$/, 'OTP must be exactly 6 digits'),
});
export type VerifyOtpPayload = z.infer<typeof VerifyOtpPayloadSchema>;

export const RefreshTokenPayloadSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshTokenPayload = z.infer<typeof RefreshTokenPayloadSchema>;

export const LogoutPayloadSchema = z.object({
  refreshToken: z.string().min(1),
});
export type LogoutPayload = z.infer<typeof LogoutPayloadSchema>;

export const MessageResponseSchema = z.object({
  message: z.string(),
});
export type MessageResponse = z.infer<typeof MessageResponseSchema>;

// ─── 4. Event Models (Prisma 7 verified) ─────────────────────────────────────

export const RegistrationStatusSchema = z.enum(['NOT_STARTED', 'OPEN', 'CLOSED']);
export type RegistrationStatus = z.infer<typeof RegistrationStatusSchema>;

export const EventSchema = z.object({
  id:                   z.string(),
  title:                z.string(),
  slug:                 z.string(),
  description:          z.string(),
  date:                 z.string(),
  location:             z.string(),
  bannerImageUrl:       z.string().nullable().optional(),
  registrationEnabled:  z.boolean(),
  registrationStatus:   RegistrationStatusSchema,
  registrationOpensAt:  z.string().nullable().optional(),
  registrationClosesAt: z.string().nullable().optional(),
  capacity:             z.number().nullable().optional(),
  registeredCount:      z.number().optional(),
  isRegistered:         z.boolean().optional(),
});
export type Event = z.infer<typeof EventSchema>;

export const EventListResponseDataSchema = z.object({
  events: z.array(EventSchema),
  pagination: z.object({
    page:        z.number(),
    limit:       z.number(),
    totalItems:  z.number(),
    totalPages:  z.number(),
    hasNextPage: z.boolean(),
  }),
});
export type EventListResponseData = z.infer<typeof EventListResponseDataSchema>;

export const EventRegistrationSchema = z.object({
  id:           z.string(),
  eventId:      z.string(),
  userId:       z.string(),
  registeredAt: z.string(),
});
export type EventRegistration = z.infer<typeof EventRegistrationSchema>;

export const EventRegistrationSuccessDataSchema = z.object({
  registration: EventRegistrationSchema,
  event: z.object({
    title: z.string(),
    slug:  z.string(),
  }),
});
export type EventRegistrationSuccessData = z.infer<typeof EventRegistrationSuccessDataSchema>;

export const UserRegistrationStatusDataSchema = z.object({
  isRegistered: z.boolean(),
  registration: z.object({
    id:           z.string(),
    registeredAt: z.string(),
  }).nullable(),
});
export type UserRegistrationStatusData = z.infer<typeof UserRegistrationStatusDataSchema>;

// ─── 5. AppConfig (Startup Gating) ───────────────────────────────────────────

export const AppConfigSchema = z.object({
  minSupportedVersionIos:     z.string(),
  minSupportedVersionAndroid: z.string(),
  latestVersionIos:           z.string(),
  latestVersionAndroid:       z.string(),
  maintenanceMode:            z.boolean(),
  maintenanceMessage:         z.string().nullable(),
  iosStoreUrl:                z.string().url(),
  androidStoreUrl:            z.string().url(),
  offlinePackTtlHours:        z.number().int().default(24),
  features: z.object({
    kitSystemEnabled:   z.boolean().default(true),
    caApplicationsOpen: z.boolean().default(true),
    idSubmissionOpen:   z.boolean().default(true),
  }),
});
export type AppConfig = z.infer<typeof AppConfigSchema>;

// ─── 6. Client Form Validation Schemas ────────────────────────────────────────

export const PasswordSchema = z
  .string()
  .min(8,   'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .refine((v) => /[A-Z]/.test(v), 'Must include at least one uppercase letter')
  .refine((v) => /[a-z]/.test(v), 'Must include at least one lowercase letter')
  .refine((v) => /[0-9]/.test(v), 'Must include at least one number');

export const LoginFormSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginForm = z.infer<typeof LoginFormSchema>;

export const SignupFormSchema = z.object({
  name:            z.string().min(1, 'Name is required').max(100),
  email:           z.string().email('Enter a valid email address'),
  password:        PasswordSchema,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
});
export type SignupForm = z.infer<typeof SignupFormSchema>;

export const ForgotPasswordFormSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});
export type ForgotPasswordForm = z.infer<typeof ForgotPasswordFormSchema>;

export const DeleteAccountFormSchema = z.object({
  password: z.string().min(1, 'Enter your password to confirm deletion'),
});
export type DeleteAccountForm = z.infer<typeof DeleteAccountFormSchema>;

export const OnboardingCompletePayloadSchema = z.object({
  name:        z.string().min(1).max(100),
  gender:      GenderSchema,
  phoneNumber: z.string().min(7).max(20),
  college:     z.string().min(1).max(200),
});
export type OnboardingCompletePayload = z.infer<typeof OnboardingCompletePayloadSchema>;

export const ProfileUpdatePayloadSchema = z.object({
  name:        z.string().min(1).max(100).optional(),
  gender:      GenderSchema.optional(),
  phoneNumber: z.string().min(7).max(20).optional(),
  college:     z.string().min(1).max(200).optional(),
  branch:      z.string().optional(),
  year:        z.number().optional(),
  promotionalEmailsOptIn: z.boolean().optional(),
  notificationPreferences: z.object({
    eventReminders: z.boolean().optional(),
    announcements:  z.boolean().optional(),
    liveUpdates:    z.boolean().optional(),
    ticketUpdates:  z.boolean().optional(),
  }).optional(),
});
export type ProfileUpdatePayload = z.infer<typeof ProfileUpdatePayloadSchema>;
