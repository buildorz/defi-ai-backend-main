const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { ENVIRONMENT } = require('./common/utils/environment');
const { errorHandler } = require('./common/utils/errorHandler');
const timeoutMiddleware = require('./modules/middlewares/timeout.middleware');
const { AuthRouter } = require('./modules/routes/auth.route');
const { UserRouter } = require('./modules/routes/user.route');
const http = require('http');
const { Server } = require('socket.io');
const { websocketSetup } = require('./modules/gateways');
const { MessageRouter } = require('./modules/routes/message.route');
const { TransactionRouter } = require('./modules/routes/transaction.route');
const { ChatHistoryRouter } = require('./modules/routes/chatHistory.route');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const expressPino = require('express-pino-logger');
const pinoPretty = require('pino-pretty');

const app = express();
let server;
let serverPort = ENVIRONMENT.APP.PORT;

server = http.createServer(app);

// Rate limiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 80 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// setup socket.io
const socketIO = new Server(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

// setup websocket
websocketSetup(socketIO);

// setup BigInt
BigInt.prototype.toJSON = function () {
  return this.toString();
};

app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// setup logger
const logger = pino(
  pinoPretty({
    level: 'info',
    redact: ['req.headers.authorization'], // redact authorization headers
    censor: ['[Redacted]'], // replace redacted fields with '[Redacted]'
    colorize: true
  })
);

const expressLogger = expressPino({ logger });

// don't use pino logger in development
if (ENVIRONMENT.APP.ENV !== 'development') {
  app.use(expressLogger);
}

/**
 *  uncaughtException handler
 */
// eslint-disable-next-line no-undef
process.on('uncaughtException', async (error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Server Shutting down...');
  console.log(error.name, error.message);
  console.error(
    'UNCAUGHT EXCEPTION!! 💥 Server Shutting down... ' +
      new Date(Date.now()) +
      error.name,
    error.message
  );
  // eslint-disable-next-line no-undef
  process.exit(1);
});

/**
 * routes
 */
app.use('/api/auth', AuthRouter);
app.use('/api/user', UserRouter);
app.use('/api/message', MessageRouter);
app.use('/api/transaction', TransactionRouter);
app.use('/api/chat-history', ChatHistoryRouter);

app.all('/*', async (req, res) => {
  console.error(
    'route not found ' + new Date(Date.now()) + ' ' + req.originalUrl
  );
  res.status(404).json({
    status: 'error',
    message: `OOPs!! No handler defined for ${req.method.toUpperCase()}: ${
      req.url
    } route. Check the API documentation for more details.`
  });
});

// start server
server.listen(serverPort, async () => {
  logger.info(`Bot is running on port ${serverPort}`);
});

/**
 * Error handler middlewares
 */
app.use(timeoutMiddleware);
app.use(errorHandler);

/**
 * unhandledRejection  handler
 */

// eslint-disable-next-line no-undef
process.on('unhandledRejection', async (error) => {
  console.log('UNHANDLED REJECTION! 💥 Server Shutting down...');
  console.log(error.name, error.message);
  console.error(
    'UNHANDLED REJECTION! 💥 Server Shutting down... ' +
      new Date(Date.now()) +
      error.name,
    error.message
  );
});
