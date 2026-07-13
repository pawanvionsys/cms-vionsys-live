import { NextRequest } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { comparePasswords, setSessionCookie } from '../../../../../features/auth/auth-options';
import { ApiResponse } from '../../../../../lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return ApiResponse.error('MISSING_FIELDS', 'Email and password are required.', null, 400);
    }

    // Find user in database
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // In development mode, if no user exists, let's seed a default super_admin user
    if (!user && process.env.NODE_ENV !== 'production') {
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

    if (!user) {
      return ApiResponse.error('INVALID_CREDENTIALS', 'Invalid email or password.', null, 401);
    }

    // Compare passwords
    const isValid = await comparePasswords(password, user.passwordHash);
    if (!isValid) {
      return ApiResponse.error('INVALID_CREDENTIALS', 'Invalid email or password.', null, 401);
    }

    // Save session
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    return ApiResponse.success({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err: any) {
    console.error('Login route error:', err);
    return ApiResponse.serverError('An error occurred during login authentication.', err.message);
  }
}
export const dynamic = 'force-dynamic';
