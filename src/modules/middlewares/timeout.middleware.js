const timeout = require('connect-timeout');

// Create the timeout middleware
const timeoutMiddleware = timeout(60000);

module.exports = timeoutMiddleware;
