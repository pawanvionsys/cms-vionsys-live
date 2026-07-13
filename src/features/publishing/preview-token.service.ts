import crypto from 'crypto';
import { env } from '../../lib/env';

export class PreviewTokenService {
  /**
   * Generates a tamper-proof hash for draft previewing.
   */
  static generateToken(id: string): string {
    return crypto
      .createHmac('sha256', env.JWT_SECRET)
      .update(id)
      .digest('hex');
  }

  /**
   * Validates if the preview token matches the content ID.
   */
  static validateToken(id: string, token: string): boolean {
    try {
      const expected = this.generateToken(id);
      return crypto.timingSafeEqual(
        Buffer.from(expected, 'utf8'),
        Buffer.from(token, 'utf8')
      );
    } catch {
      return false;
    }
  }
}
