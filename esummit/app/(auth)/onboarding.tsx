/**
 * Onboarding screen (spec §7.11)
 *
 * SPEC GAP G1: The onboarding form is driven dynamically by
 * src/features/auth/onboardingFields.ts. No field keys are hardcoded
 * in the JSX layout. When backend fields change, update that file only.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Screen, Button, TextField } from '../../src/components';
import { colors, typography, spacing, radii } from '../../src/theme';
import { UserCheck, AlertCircle, Sparkles } from 'lucide-react-native';
import { api } from '../../src/api/client';
import { useAuthStore, selectUser } from '../../src/store/authStore';
import { ONBOARDING_FIELDS, OnboardingField } from '../../src/features/auth/onboardingFields';
import { OnboardingCompletePayloadSchema, type Gender } from '../../src/lib/schemas';
import { AppApiError } from '../../src/lib/errors';

export default function OnboardingScreen(): React.JSX.Element {
  const user = useAuthStore(selectUser);
  const { setUser } = useAuthStore();

  // Initialize form state from existing user data or empty defaults
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of ONBOARDING_FIELDS) {
      if (field.key === 'name' && user?.name) {
        initial[field.key] = user.name;
      } else if (field.key === 'gender' && user?.gender) {
        initial[field.key] = user.gender;
      } else if (field.key === 'phoneNumber' && user?.phoneNumber) {
        initial[field.key] = user.phoneNumber;
      } else if (field.key === 'college' && user?.college) {
        initial[field.key] = user.college;
      } else {
        initial[field.key] = '';
      }
    }
    return initial;
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading]           = useState(false);

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
    if (generalError) setGeneralError(null);
  };

  const handleSubmit = async () => {
    setGeneralError(null);
    setFieldErrors({});

    // Validate using Zod schema
    const payload = {
      name:        formData['name']?.trim() ?? '',
      gender:      formData['gender'] as Gender,
      phoneNumber: formData['phoneNumber']?.trim() ?? '',
      college:     formData['college']?.trim() ?? '',
    };

    const result = OnboardingCompletePayloadSchema.safeParse(payload);
    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors;
      const errors: Record<string, string | undefined> = {};
      for (const [key, msgs] of Object.entries(flattened)) {
        if (msgs?.[0]) errors[key] = msgs[0];
      }
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await api.completeOnboarding(payload);
      setUser(updatedUser);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      if (err instanceof AppApiError) {
        setGeneralError(err.message);
      } else if (err instanceof Error) {
        setGeneralError(err.message);
      } else {
        setGeneralError('Failed to save profile details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: OnboardingField) => {
    const value = formData[field.key] ?? '';
    const error = fieldErrors[field.key];

    if (field.type === 'select' && field.options) {
      return (
        <View key={field.key} style={styles.selectContainer}>
          <Text style={styles.selectLabel}>{field.label}</Text>
          <View style={styles.optionsWrap}>
            {field.options.map((option) => {
              const isSelected = value === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleFieldChange(field.key, option.value)}
                  style={[
                    styles.optionChip,
                    isSelected && styles.optionChipSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {error && <Text style={styles.fieldErrorText}>{error}</Text>}
        </View>
      );
    }

    return (
      <TextField
        key={field.key}
        label={field.label}
        placeholder={field.placeholder}
        value={value}
        onChangeText={(v) => handleFieldChange(field.key, v)}
        keyboardType={field.keyboardType ?? 'default'}
        maxLength={field.maxLength}
        error={error}
      />
    );
  };

  return (
    <Screen scroll keyboardAware contentStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Sparkles size={14} color={colors.primary} strokeWidth={2} />
          <Text style={styles.badgeText}>STEP 2 OF 2</Text>
        </View>
        <Text style={styles.title}>Complete your profile</Text>
        <Text style={styles.subtitle}>
          This information will be printed on your digital badge and delegate pass.
        </Text>
      </View>

      {/* General error banner */}
      {generalError && (
        <View style={styles.errorBanner}>
          <AlertCircle size={18} color={colors.error} strokeWidth={2} />
          <Text style={styles.errorText}>{generalError}</Text>
        </View>
      )}

      {/* Form Fields dynamically rendered */}
      <View style={styles.form}>
        {ONBOARDING_FIELDS.map(renderField)}

        <Button
          label="Save & continue to Summit"
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          size="lg"
          rightIcon={<UserCheck size={18} color={colors.textInverse} strokeWidth={2} />}
          style={styles.submitButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing['6'],
    paddingBottom: spacing['10'],
  },
  header: {
    marginBottom: spacing['6'],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    backgroundColor: colors.surfaceElevated,
    alignSelf: 'flex-start',
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: radii.full,
    marginBottom: spacing['3'],
  },
  badgeText: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize: typography.size3xs,
    color: colors.primary,
    letterSpacing: typography.trackingWidest,
  },
  title: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.size3xl,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.sizeBase,
    color: colors.textSecondary,
    marginTop: spacing['2'],
    lineHeight: typography.sizeBase * typography.lineHeightNormal,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing['3'],
    marginBottom: spacing['4'],
  },
  errorText: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    color: colors.error,
    flex: 1,
  },
  form: {
    gap: spacing['5'],
  },
  selectContainer: {
    gap: spacing['2'],
  },
  selectLabel: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
  },
  optionChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontFamily: typography.fontFamilyMedium,
    fontSize: typography.sizeSm,
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.textInverse,
    fontFamily: typography.fontFamilySemiBold,
  },
  fieldErrorText: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.sizeXs,
    color: colors.error,
    marginTop: spacing['1'],
  },
  submitButton: {
    marginTop: spacing['4'],
  },
});
