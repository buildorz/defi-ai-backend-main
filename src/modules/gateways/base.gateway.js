const { prismaClientService } = require('../../../prisma/prisma-client');

class BaseGateway {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;

    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('newChat', (data) => {
      this.sendData(this.socket.id, 'newChat', data);
    });

    this.socket.on('userLogin', async ({ walletAddress }) => {
      console.log("User login...", walletAddress);
      if (!walletAddress) return;

      const user = await prismaClientService.users.findFirst({
        where: { wallet: walletAddress }
      });

      if (!user) {
        this.sendData(this.socket.id, 'invalidCredentials', 'Invalid credentials');
        return;
      }

      this.sendData(
        this.socket.id,
        'systemMessage',
        `Welcome back, ${user?.username || walletAddress}!`
      );
    });
  }

  sendData(socketId, key, data) {
    try {
      this.io.to(socketId).emit(key, data);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = BaseGateway;
