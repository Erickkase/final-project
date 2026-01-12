import passwordService from '../services/password.service';

describe('Password Service', () => {
  const testPassword = 'SecurePassword123!';
  const weakPassword = 'weak';

  it('should hash a password', async () => {
    const hash = await passwordService.hash(testPassword);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(testPassword);
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should compare password with hash', async () => {
    const hash = await passwordService.hash(testPassword);
    const isValid = await passwordService.compare(testPassword, hash);
    expect(isValid).toBe(true);
  });

  it('should return false for incorrect password', async () => {
    const hash = await passwordService.hash(testPassword);
    const isValid = await passwordService.compare('WrongPassword123!', hash);
    expect(isValid).toBe(false);
  });

  it('should validate strong password', () => {
    const result = passwordService.validateStrength(testPassword);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should reject weak password', () => {
    const result = passwordService.validateStrength(weakPassword);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should require minimum 8 characters', () => {
    const result = passwordService.validateStrength('Short1!');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e: string) => e.includes('8 caracteres'))).toBe(true);
  });

  it('should require uppercase letter', () => {
    const result = passwordService.validateStrength('password123!');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e: string) => e.includes('mayúscula'))).toBe(true);
  });

  it('should require lowercase letter', () => {
    const result = passwordService.validateStrength('PASSWORD123!');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e: string) => e.includes('minúscula'))).toBe(true);
  });

  it('should require number', () => {
    const result = passwordService.validateStrength('PasswordSpecial!');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e: string) => e.includes('número'))).toBe(true);
  });

  it('should require special character', () => {
    const result = passwordService.validateStrength('Password123');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e: string) => e.includes('especial'))).toBe(true);
  });
});
