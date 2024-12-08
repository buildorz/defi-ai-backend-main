const BaseGateway = require('./base.gateway');
const ChatGateway = require('./chat.gateway');

const websocketSetup = (io) => {
  io.on('connection', (socket) => {
    console.log('new socket connection', socket.id);

    new BaseGateway(io, socket);
    new ChatGateway(io, socket);
  });
};

module.exports = { websocketSetup };
