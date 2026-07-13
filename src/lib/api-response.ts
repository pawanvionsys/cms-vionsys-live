import { NextResponse } from 'next/server';
import { ApiResponse as ApiResponseInterface } from '../types/api';

export class ApiResponse {
  static success<T = any>(data: T, meta?: any, status = 200) {
    const responseBody: ApiResponseInterface<T> = {
      success: true,
      data,
      meta,
    };
    return NextResponse.json(responseBody, { status });
  }

  static error(code: string, message: string, details?: any, status = 400) {
    const responseBody: ApiResponseInterface<any> = {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };
    return NextResponse.json(responseBody, { status });
  }

  static unauthorized(message = 'Unauthorized access') {
    return this.error('UNAUTHORIZED', message, undefined, 401);
  }

  static forbidden(message = 'Forbidden access') {
    return this.error('FORBIDDEN', message, undefined, 403);
  }

  static notFound(message = 'Resource not found') {
    return this.error('NOT_FOUND', message, undefined, 404);
  }

  static serverError(message = 'An unexpected error occurred', details?: any) {
    return this.error('INTERNAL_SERVER_ERROR', message, details, 500);
  }
}
