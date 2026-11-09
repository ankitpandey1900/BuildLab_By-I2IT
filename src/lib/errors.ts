import { NextResponse } from "next/server";

/**
 * Base custom API Error class with HTTP status code and optional headers/details.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly headers?: Record<string, string>;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    headers?: Record<string, string>,
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.headers = headers;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = "Bad request.", details?: unknown) {
    super(message, 400, undefined, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized. Authentication required.") {
    super(message, 401);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden. Admin privileges required.") {
    super(message, 403);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found.") {
    super(message, 404);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = "Conflict.") {
    super(message, 409);
  }
}

export class RateLimitError extends ApiError {
  public readonly retryAfterSeconds: number;

  constructor(
    message: string = "Too many requests. Please wait before retrying.",
    retryAfterSeconds: number = 60
  ) {
    super(message, 429, { "Retry-After": String(retryAfterSeconds) });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = "Internal server error.") {
    super(message, 500);
  }
}

/**
 * Global API error handler for Next.js route handlers.
 * Transforms custom ApiError instances into standardized JSON responses,
 * preserving message, error, status code, and headers.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        message: error.message,
        error: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
      {
        status: error.statusCode,
        headers: error.headers,
      }
    );
  }

  console.error("Unhandled internal server error:", error);
  return NextResponse.json(
    {
      message: "Internal server error.",
      error: "Internal server error.",
    },
    { status: 500 }
  );
}

