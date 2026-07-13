export type Role = 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'EDITOR' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  iat?: number;
  exp?: number;
}
