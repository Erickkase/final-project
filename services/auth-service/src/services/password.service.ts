import bcryptjs from 'bcryptjs';
import config from '../config/config';

class PasswordService {
  /**
   * Encripta una contraseña
   */
  async hash(password: string): Promise<string> {
    return bcryptjs.hash(password, config.bcryptRounds);
  }

  /**
   * Compara una contraseña con su hash
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }

  /**
   * Valida la fuerza de una contraseña
   */
  validateStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default new PasswordService();
