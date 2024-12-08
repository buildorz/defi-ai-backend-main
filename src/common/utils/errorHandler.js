const { AppError } = require('./appError');
const { ENVIRONMENT } = require('./environment');

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again!', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired!', 401);
};

const handleTimeoutError = () => {
  return new AppError('Request timeout', 408);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err.data
  });
};

const sendErrorProd = (err, res) => {
  if (err?.isOperational) {
    console.log('Error: ', err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err.data
    });
  } else {
    console.log('Error: ', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _) => {
  err.statusCode =
    typeof err.statusCode === 'number' ? err.statusCode : 500;
  err.status = err.status || 'Error';

  if (ENVIRONMENT.APP.ENV === 'development') {
    console.error(
      `${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    sendErrorDev(err, res);
  } else {
    let error = err;

    if ('timeout' in err && err.timeout) error = handleTimeoutError();
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

module.exports = { errorHandler };
