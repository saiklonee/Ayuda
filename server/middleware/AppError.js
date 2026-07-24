// A single, predictable error shape used across every route, so controllers
// don't need to know HTTP status codes.
export class AppError extends Error {
  constructor(message, statusCode = 400, code = "BAD_REQUEST") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }

  static notFound(message = "Resource not found") {
    return new AppError(message, 404, "NOT_FOUND");
  }

  static forbidden(message = "Not allowed") {
    return new AppError(message, 403, "FORBIDDEN");
  }

  static unauthorized(message = "Authentication required") {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  static conflict(message = "Conflict") {
    return new AppError(message, 409, "CONFLICT");
  }
}
