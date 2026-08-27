import { NextRequest } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { comparePasswords, attachSessionCookie } from '../../../../../features/auth/auth-options';
import { ApiResponse } from '../../../../../lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return ApiResponse.error('MISSING_FIELDS', 'Email and password are required.', null, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user in database
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    // Bootstrap the first admin if the database has no users yet.
    if (!user) {
      const userCount = await prisma.user.count();
      if (userCount === 0 && normalizedEmail === 'admin@vionsys.com' && password === 'admin123') {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('admin123', salt);

        user = await prisma.user.create({
          data: {
            email: 'admin@vionsys.com',
            name: 'Super Admin User',
            passwordHash,
            role: 'SUPER_ADMIN'
          }
        });
      }
    }

    if (!user) {
      return ApiResponse.error('INVALID_CREDENTIALS', 'Invalid email or password.', null, 401);
    }

    // Compare passwords
    const isValid = await comparePasswords(password, user.passwordHash);
    if (!isValid) {
      return ApiResponse.error('INVALID_CREDENTIALS', 'Invalid email or password.', null, 401);
    }

    const response = ApiResponse.success({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    return attachSessionCookie(response, {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (err: any) {
    console.error('Login route error:', err);
    return ApiResponse.serverError('An error occurred during login authentication.', err.message);
  }
}
export const dynamic = 'force-dynamic';
