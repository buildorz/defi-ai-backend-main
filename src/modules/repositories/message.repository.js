const { prismaClientService } = require('../../../prisma/prisma-client');
const { ErrorHandler } = require('../../common/utils/appError');

class MessageRepository {
  async getUserMessage(userId) {
    try {
      return await prismaClientService.messages.findFirst({
        where: {
          user_id: userId
        }
      });
    } catch (error) {
      ErrorHandler.dbErrors(error);
    }
  }

  async createOrUpdateUserMessage(userId, messages) {
    try {
      const [user, userMessageExist] = await Promise.all([
        prismaClientService.users.findFirst({
          where: {
            id: userId
          }
        }),
        this.getUserMessage(userId)
      ]);

      if (!user) {
        return null;
      }

      const jsonMessage = JSON.stringify(messages);

      if (userMessageExist) {
        return await prismaClientService.messages.update({
          where: {
            id: userMessageExist.id,
            user_id: userId
          },
          data: {
            messages: jsonMessage
          }
        });
      } else {
        return await prismaClientService.messages.create({
          data: {
            messages: jsonMessage,
            user_id: userId
          }
        });
      }
    } catch (error) {
      ErrorHandler.dbErrors(error);
    }
  }

  async deleteUserMessage(userId) {
    try {
      const result = await prismaClientService.messages.deleteMany({
        where: {
          user_id: userId
        }
      });

      return result?.count ?? 0;
    } catch (error) {
      ErrorHandler.dbErrors(error);
    }
  }

  async deleteAllUserMessages() {
    try {
      await prismaClientService.messages.deleteMany();
      return true;
    } catch (error) {
      ErrorHandler.dbErrors(error);
      return false;
    }
  }
}

module.exports = { MessageRepository: new MessageRepository() };
