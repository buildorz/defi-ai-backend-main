const { prismaClientService } = require('../../../prisma/prisma-client');
const { ErrorHandler } = require('../../common/utils/appError');

class ChatHistoryRepository {
  async getUserChatHistoryPaginated(userId, page = 1, limit = 100) {
    const offset = parseInt((page - 1) * limit);
    const limitValue = limit > 500 ? 500 : parseInt(limit);

    const query = {
      where: {
        user_id: userId
      },
      orderBy: {
        created_at: 'asc'
      },
      skip: offset,
      take: limitValue
    };

    const [chatHistory, total] = await Promise.all([
      prismaClientService.chat_history.findMany(query),
      prismaClientService.chat_history.count({
        where: {
          user_id: userId
        }
      })
    ]);

    return {
      data: chatHistory,
      pagination: {
        total,
        page: parseInt(page),
        limit: limitValue
      }
    };
  }

  async addChatHistory(userId, message, role, image = null) {
    try {
      return await prismaClientService.chat_history.create({
        data: {
          user_id: userId,
          message,
          role,
          image
        }
      });
    } catch (error) {
      ErrorHandler.dbErrors(error);
    }
  }

  async deleteChatHistory(userId) {
    try {
      await prismaClientService.chat_history.deleteMany({
        where: {
          user_id: userId
        }
      });
    } catch (error) {
      ErrorHandler.dbErrors(error);
    }
  }
}

module.exports = { ChatHistoryRepository: new ChatHistoryRepository() };
