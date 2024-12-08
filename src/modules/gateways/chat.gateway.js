const { runConversation } = require('../services/runConversation');
const {
  transcribeAudioToText
} = require('../../common/utils/openai-helper/transcribeAudio');

class ChatGateway {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;

    this.setupListeners();
  }

  setupListeners() {
    this.socket.on(
      'newMessage',
      async ({ userId, message, blockchain, audioMessage }) => {
        console.log('data from new message ', { userId, message, blockchain, audioMessage });

        if (!userId || (!message && !audioMessage) || !blockchain) {
          return this.sendData(this.socket.id, 'newMessageResponse', {
            error: 'userId, Message or connected blockchain is missing'
          });
        }

        if (audioMessage) {
          const transcribedMessage = await transcribeAudioToText(audioMessage);

          if (!transcribedMessage?.success) {
            return this.sendData(this.socket.id, 'newMessageResponse', {
              error:
                'Unable to process your message at the moment. Please try again later.'
            });
          }

          message = transcribedMessage?.text;
        }

        const response = await runConversation(userId, message, blockchain);
        this.sendData(this.socket.id, 'newMessageResponse', {
          success: response
        });
      }
    );
  }

  sendData(socketId, key, data) {
    try {
      this.io.to(socketId).emit(key, data);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = ChatGateway;
