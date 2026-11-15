/**
 * Login / Sign up — /login (open in sign-up mode with /login?mode=signup)
 *
 * One screen, two modes:
 * - Login:   email, password, "Forgot password?"
 * - Sign up: + full name, college
 *
 * Auth runs through useAuthActions → authService (currently a fake that
 * accepts any credentials). See src/features/auth/authService.ts.
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { ArrowLeft, Eye, EyeOff, GraduationCap, Lock, Mail, User } from 'lucide-react-native';
import { Button, IconButton, Input, Screen } from '../../src/components';
import { useAuthActions } from '../../src/features/auth/useAuthActions';
import { colors, googleColors, fontFamily, fontSize, minTouchTarget, radius, spacing } from '../../src/theme';

type Mode = 'login' | 'signup';
type Field = 'name' | 'college' | 'email' | 'password';
type Errors = Partial<Record<Field, string>>;

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const MIN_PASSWORD = 8;

function validate(mode: Mode, v: Record<Field, string>): Errors {
  const e: Errors = {};
  if (mode === 'signup') {
    if (!v.name.trim()) e.name = 'Enter your full name';
    if (!v.college.trim()) e.college = 'Enter your college';
  }
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address';
  if (!v.password) e.password = 'Enter your password';
  else if (mode === 'signup' && v.password.length < MIN_PASSWORD)
    e.password = `Use at least ${MIN_PASSWORD} characters`;
  return e;
}

export default function LoginScreen(): React.JSX.Element {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<Mode>(params.mode === 'signup' ? 'signup' : 'login');
  const [values, setValues] = useState<Record<Field, string>>({
    name: '',
    college: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<'form' | 'google' | null>(null);
  const auth = useAuthActions();
  const isSignup = mode === 'signup';

  const set = (field: Field) => (text: string) => {
    setValues((v) => ({ ...v, [field]: text }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors({});
    setFormError(null);
  };

  const run = async (kind: 'form' | 'google', action: () => Promise<unknown>) => {
    setFormError(null);
    setBusy(kind);
    try {
      await action();
      router.replace('/(tabs)');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setBusy(null);
    }
  };

  const submit = () => {
    const e = validate(mode, values);
    setErrors(e);
    if (Object.keys(e).length) return;
    const email = values.email.trim();
    run('form', () =>
      isSignup
        ? auth.signup({ email, password: values.password, name: values.name, college: values.college })
        : auth.login({ email, password: values.password }),
    );
  };

  return (
    <Screen scroll keyboardAware contentStyle={styles.content}>
      <View style={styles.topRow}>
        {router.canGoBack() ? (
          <IconButton
            icon={ArrowLeft}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          />
        ) : null}
      </View>

      <Text style={styles.title}>{isSignup ? 'Create account' : 'Welcome back'}</Text>
      <Text style={styles.subtitle}>
        {isSignup ? 'Sign up to register for events and get your pass.' : 'Log in to continue to E-Summit.'}
      </Text>

      <View style={styles.toggle} accessibilityRole="tablist">
        {(['login', 'signup'] as const).map((m) => {
          const active = mode === m;
          return (
            <Pressable
              key={m}
              onPress={() => switchMode(m)}
              style={[styles.toggleItem, active && styles.toggleItemActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>
                {m === 'login' ? 'Login' : 'Sign up'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.form}>
        {isSignup ? (
          <>
            <Input
              placeholder="Full name"
              value={values.name}
              onChangeText={set('name')}
              error={errors.name}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              leftIcon={<User size={18} color={colors.textMuted} />}
            />
            <Input
              placeholder="College"
              value={values.college}
              onChangeText={set('college')}
              error={errors.college}
              autoCapitalize="words"
              leftIcon={<GraduationCap size={18} color={colors.textMuted} />}
            />
          </>
        ) : null}
        <Input
          placeholder="Email"
          value={values.email}
          onChangeText={set('email')}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          leftIcon={<Mail size={18} color={colors.textMuted} />}
        />
        <Input
          placeholder="Password"
          value={values.password}
          onChangeText={set('password')}
          error={errors.password}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          textContentType={isSignup ? 'newPassword' : 'password'}
          returnKeyType="go"
          onSubmitEditing={submit}
          leftIcon={<Lock size={18} color={colors.textMuted} />}
          rightIcon={
            <Pressable
              onPress={() => setShowPassword((s) => !s)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff size={18} color={colors.textMuted} />
              ) : (
                <Eye size={18} color={colors.textMuted} />
              )}
            </Pressable>
          }
        />

        {!isSignup ? (
          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgot}
            hitSlop={8}
            accessibilityRole="link"
          >
            <Text style={styles.forgotLabel}>Forgot password?</Text>
          </Pressable>
        ) : null}
      </View>

      {formError ? (
        <Text style={styles.formError} accessibilityLiveRegion="polite">
          {formError}
        </Text>
      ) : null}

      <Button
        label={isSignup ? 'Sign up' : 'Login'}
        onPress={submit}
        loading={busy === 'form'}
        disabled={busy !== null}
        fullWidth
        size="lg"
      />

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleButton
        onPress={() => run('google', auth.loginWithGoogle)}
        loading={busy === 'google'}
        disabled={busy !== null}
      />
    </Screen>
  );
}

function GoogleButton({
  onPress,
  loading,
  disabled,
}: {
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      accessibilityState={{ disabled, busy: loading }}
      style={({ pressed }) => [
        styles.google,
        pressed && styles.googlePressed,
        disabled && !loading && styles.googleDisabled,
      ]}
    >
      <GoogleG />
      <Text style={styles.googleLabel}>{loading ? 'Connecting…' : 'Continue with Google'}</Text>
    </Pressable>
  );
}

/** Standard multicolour Google "G" mark. */
function GoogleG() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path fill={googleColors.red} d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill={googleColors.blue} d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill={googleColors.yellow} d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill={googleColors.green} d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing['2'] },
  topRow: { height: minTouchTarget, justifyContent: 'center', marginBottom: spacing['4'] },
  title: { fontFamily: fontFamily.heading, fontSize: fontSize['4xl'], color: colors.text },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    marginTop: spacing['2'],
    lineHeight: fontSize.base * 1.5,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
    padding: spacing['1'],
    marginTop: spacing['8'],
    marginBottom: spacing['6'],
  },
  toggleItem: {
    flex: 1,
    height: minTouchTarget,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleItemActive: { backgroundColor: colors.primary },
  toggleLabel: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.base, color: colors.textMuted },
  toggleLabelActive: { color: colors.onPrimary },
  form: { gap: spacing['3'], marginBottom: spacing['6'] },
  forgot: { alignSelf: 'flex-end', paddingVertical: spacing['1'] },
  forgotLabel: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.sm, color: colors.accent },
  formError: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing['4'],
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginVertical: spacing['6'],
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.cardBorder },
  dividerLabel: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.textDim },
  google: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.onPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['3'],
  },
  googlePressed: { opacity: 0.85 },
  googleDisabled: { opacity: 0.45 },
  googleLabel: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.md, color: colors.background },
});
