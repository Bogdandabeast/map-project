import { describe, expect, it } from 'bun:test';
import { signInSchema, signUpSchema } from './index';

describe('signInSchema', () => {
  it('should accept a valid email and password', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'securePass123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
      expect(result.data.password).toBe('securePass123');
    }
  });

  it('should reject an invalid email', () => {
    const result = signInSchema.safeParse({
      email: 'not-an-email',
      password: 'securePass123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toHaveProperty('email');
    }
  });

  it('should reject a password shorter than 8 characters', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: '1234567',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toHaveProperty('password');
    }
  });

  it('should accept a password exactly 8 characters', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: '12345678',
    });

    expect(result.success).toBe(true);
  });

  it('should reject empty email', () => {
    const result = signInSchema.safeParse({
      email: '',
      password: 'securePass123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toHaveProperty('email');
    }
  });

  it('should reject missing fields', () => {
    const result = signInSchema.safeParse({});

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      expect(fields).toHaveProperty('email');
      expect(fields).toHaveProperty('password');
    }
  });
});

describe('signUpSchema', () => {
  it('should accept valid name, email, and password', () => {
    const result = signUpSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePass123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('John Doe');
      expect(result.data.email).toBe('john@example.com');
      expect(result.data.password).toBe('securePass123');
    }
  });

  it('should reject an empty name', () => {
    const result = signUpSchema.safeParse({
      name: '',
      email: 'john@example.com',
      password: 'securePass123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toHaveProperty('name');
    }
  });

  it('should reject an invalid email in sign up', () => {
    const result = signUpSchema.safeParse({
      name: 'John Doe',
      email: 'bad-email',
      password: 'securePass123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toHaveProperty('email');
    }
  });

  it('should reject a short password in sign up', () => {
    const result = signUpSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: '123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toHaveProperty('password');
    }
  });

  it('should reject all missing fields', () => {
    const result = signUpSchema.safeParse({});

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      expect(fields).toHaveProperty('name');
      expect(fields).toHaveProperty('email');
      expect(fields).toHaveProperty('password');
    }
  });

  it('should accept a single character name', () => {
    const result = signUpSchema.safeParse({
      name: 'J',
      email: 'j@example.com',
      password: '12345678',
    });

    expect(result.success).toBe(true);
  });
});
