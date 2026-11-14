/**
 * Onboarding field definitions — single source of truth.
 *
 * SPEC GAP G1: The final onboarding field mapping is not decided.
 * Today User.year stores age and User.branch stores college.
 * This array defines what the UI shows and what payload key it sends.
 * Change fields HERE ONLY when the backend schema is finalised.
 *
 * Each field maps to:
 *   - key:         The payload key sent to POST /onboarding/complete
 *   - label:       Displayed above the input
 *   - type:        'text' | 'select' | 'phone'
 *   - options:     Only for type='select'
 *   - placeholder: Input hint
 *   - required:    Whether Zod should enforce non-empty
 */

export interface OnboardingFieldOption {
  value: string;
  label: string;
}

export interface OnboardingField {
  key:         string;
  label:       string;
  type:        'text' | 'select' | 'phone';
  placeholder: string;
  required:    boolean;
  options?:    OnboardingFieldOption[];
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  maxLength?:  number;
}

/**
 * The canonical list of onboarding fields for Phase 3.
 * When G1 is resolved, update this array only — no screen code changes needed.
 */
export const ONBOARDING_FIELDS: OnboardingField[] = [
  {
    key:         'name',
    label:       'Full name',
    type:        'text',
    placeholder: 'Your full name',
    required:    true,
    maxLength:   100,
  },
  {
    key:         'gender',
    label:       'Gender',
    type:        'select',
    placeholder: 'Select gender',
    required:    true,
    options: [
      { value: 'MALE',              label: 'Male'               },
      { value: 'FEMALE',            label: 'Female'             },
      { value: 'NON_BINARY',        label: 'Non-binary'         },
      { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say'  },
    ],
  },
  {
    key:          'phoneNumber',
    label:        'Phone number',
    type:         'phone',
    placeholder:  '+91 98765 43210',
    required:     true,
    keyboardType: 'phone-pad',
    maxLength:    20,
  },
  {
    key:         'college',
    label:       'College or institution',
    type:        'text',
    placeholder: 'e.g. MNIT Jaipur',
    required:    true,
    maxLength:   200,
    // NOTE: server stores this in User.branch (see spec gap G1)
  },
];
