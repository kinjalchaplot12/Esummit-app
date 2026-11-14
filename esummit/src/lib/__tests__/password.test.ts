/**
 * Unit tests for Password validation and Signup form schema.
 *
 * Rules per spec §5.3:
 * - 8 to 128 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 */

import { PasswordSchema, SignupFormSchema } from '../schemas';

describe('PasswordSchema', () => {
  it('accepts a valid password meeting all requirements', () => {
    const result = PasswordSchema.safeParse('SecurePass123');
    expect(result.success).toBe(true);
  });

  it('accepts an 8-character minimum boundary password', () => {
    const result = PasswordSchema.safeParse('Abc12345');
    expect(result.success).toBe(true);
  });

  it('accepts a 128-character maximum boundary password', () => {
    const longPassword = 'A' + 'a'.repeat(126) + '1';
    expect(longPassword.length).toBe(128);
    const result = PasswordSchema.safeParse(longPassword);
    expect(result.success).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    const result = PasswordSchema.safeParse('Abc1234');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain('at least 8 characters');
    }
  });

  it('rejects passwords longer than 128 characters', () => {
    const tooLong = 'A' + 'a'.repeat(127) + '1';
    expect(tooLong.length).toBe(129);
    const result = PasswordSchema.safeParse(tooLong);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain('at most 128 characters');
    }
  });

  it('rejects passwords with no uppercase letter', () => {
    const result = PasswordSchema.safeParse('alllowercase123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain('uppercase');
    }
  });

  it('rejects passwords with no lowercase letter', () => {
    const result = PasswordSchema.safeParse('ALLUPPERCASE123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain('lowercase');
    }
  });

  it('rejects passwords with no numbers', () => {
    const result = PasswordSchema.safeParse('NoNumbersHere');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain('number');
    }
  });
});

describe('SignupFormSchema', () => {
  it('passes when password and confirmPassword match', () => {
    const result = SignupFormSchema.safeParse({
      name:            'Test Delegate',
      email:           'delegate@example.com',
      password:        'ValidPass123',
      confirmPassword: 'ValidPass123',
    });
    expect(result.success).toBe(true);
  });

  it('fails when password and confirmPassword do not match', () => {
    const result = SignupFormSchema.safeParse({
      name:            'Test Delegate',
      email:           'delegate@example.com',
      password:        'ValidPass123',
      confirmPassword: 'MismatchPassword999',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors;
      expect(flattened.confirmPassword).toContain('Passwords do not match');
    }
  });
});
