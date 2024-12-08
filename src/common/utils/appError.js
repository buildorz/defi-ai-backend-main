class AppError extends Error {
  statusCode;
  status;
  isOperational;
  data;

  constructor(message, statusCode = 400, data) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('5') ? 'Failed' : 'Error';
    this.isOperational = true;
    this.data = data;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * joi validation error
 */
class JoiValidationError extends Error {
  data;
  statusCode;

  constructor(error) {
    super();
    this.name = 'joiValidationError';
    this.data = null;
    this.message = error.details[0].message;
    this.statusCode = 400;
  }
}

class ErrorHandler {
  static asyncErrors(error, tag) {
    console.log(`${tag ?? 'async error :'}`, error);
  }

  static dbErrors(error, tag) {
    this.asyncErrors(error, tag);
  }
}

module.exports = { AppError, JoiValidationError, ErrorHandler };
