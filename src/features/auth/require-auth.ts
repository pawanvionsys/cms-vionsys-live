import { redirect } from 'next/navigation';
import { getSession } from './auth-options';
import { SessionPayload } from '../../types/user';

/**
 * Server-side route guard for pages.
 * Ensures user is authenticated. Redirects to /login if not.
 */
export async function requireAuthPage(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

/**
 * Server-side route guard for auth pages (like /login).
 * Redirects authenticated users to /dashboard.
 */
export async function requireGuestPage(): Promise<void> {
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }
}
