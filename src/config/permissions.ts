import { Role } from '../types/user';

export type Permission =
  | 'content:create'
  | 'content:edit'
  | 'content:publish'
  | 'content:delete'
  | 'content:archive'
  | 'media:upload'
  | 'media:delete'
  | 'taxonomy:manage'
  | 'settings:manage'
  | 'users:manage'
  | 'apikeys:manage';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    'content:create',
    'content:edit',
    'content:publish',
    'content:delete',
    'content:archive',
    'media:upload',
    'media:delete',
    'taxonomy:manage',
    'settings:manage',
    'users:manage',
    'apikeys:manage'
  ],
  CONTENT_MANAGER: [
    'content:create',
    'content:edit',
    'content:publish',
    'content:archive',
    'media:upload',
    'media:delete',
    'taxonomy:manage'
  ],
  EDITOR: [
    'content:create',
    'content:edit',
    'media:upload'
    // 'content:publish' is enabled based on specific workflow checks, but defaults to draft save
  ],
  VIEWER: []
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
