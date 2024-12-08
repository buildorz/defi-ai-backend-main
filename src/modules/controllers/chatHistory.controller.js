const { AppError } = require("../../common/utils/appError");
const { AppResponse } = require("../../common/utils/appResponse");
const catchAsync = require("../middlewares/asyncWrapper.middleware");
const {
  ChatHistoryRepository,
} = require("../repositories/chatHistory.repository");
const { MessageRepository } = require("../repositories/message.repository");

class ChatHistoryController {
  getUserChatHistoryPaginated = catchAsync(async (req, res) => {
    const userId = req?.user?.id;
    const { page, limit } = req.query;

    if (!userId) {
      throw new AppError("Unable to retrieve user chat history", 400);
    }

    const result = await ChatHistoryRepository.getUserChatHistoryPaginated(
      userId,
      page,
      limit,
    );

    if (!result) {
      throw new AppError(
        `Chat history for user with id: ${userId} not found`,
        404,
      );
    }

    return AppResponse({
      res,
      statusCode: 200,
      data: result,
      message: `Chat history for user with id: ${userId} retrieved`,
    });
  });

  addChatHistory = catchAsync(async (req, res) => {
    const userId = req?.user?.id;
    const { message, role } = req.body;

    if (!userId || !message || !role) {
      throw new AppError("Unable to add chat history", 400);
    }

    const result = await ChatHistoryRepository.addChatHistory(
      userId,
      message,
      role,
    );

    if (!result) {
      throw new AppError("Unable to add chat history", 400);
    }

    return AppResponse({
      res,
      statusCode: 200,
      data: result,
      message: `Chat history for user with id: ${userId} added`,
    });
  });

  deleteUserChatHistory = catchAsync(async (req, res) => {
    const userId = req?.user?.id;

    if (!userId) {
      throw new AppError("Unable to delete chat history", 400);
    }

    // delete chat history and message context also
    await Promise.allSettled([
      ChatHistoryRepository.deleteChatHistory(userId),
      MessageRepository.deleteUserMessage(userId),
    ]);

    return AppResponse({
      res,
      statusCode: 200,
      message: `Chat history for user with id: ${userId} deleted`,
    });
  });
}

module.exports = { ChatHistoryController: new ChatHistoryController() };
