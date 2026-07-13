import { getSession } from './auth-options';
import { ROLE_PERMISSIONS, Permission } from '../../config/permissions';
import { AuthError, ForbiddenError } from '../../lib/errors';
import { Role, SessionPayload } from '../../types/user';

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new AuthError('Session expired or user is not logged in.');
  }
  return session;
}

export async function authorizeUser(permission: Permission): Promise<SessionPayload> {
  const session = await requireAuth();
  const userPermissions = ROLE_PERMISSIONS[session.role as Role] || [];
  
  if (!userPermissions.includes(permission)) {
    throw new ForbiddenError(`You do not have the required permissions: ${permission}`);
  }
  
  return session;
}

export async function checkPermission(permission: Permission): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  const userPermissions = ROLE_PERMISSIONS[session.role as Role] || [];
  return userPermissions.includes(permission);
}
