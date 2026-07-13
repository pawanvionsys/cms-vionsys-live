export class AppError extends Error {
  public code: string;
  public status: number;
  public details?: any;

  constructor(message: string, code = 'APP_ERROR', status = 400, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
    Error.captureStackTrace(this.target, this.constructor);
  }

  // Get self reference for StackTrace capturing compatibility
  private get target() {
    return this;
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthorized access', code = 'UNAUTHORIZED', details?: any) {
    super(message, code, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access', code = 'FORBIDDEN', details?: any) {
    super(message, code, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND', details?: any) {
    super(message, code, 404, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: any) {
    super(message, 'VALIDATION_ERROR', 422, details);
  }
}
