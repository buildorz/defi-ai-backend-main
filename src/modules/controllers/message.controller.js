const { AppError } = require("../../common/utils/appError");
const { AppResponse } = require("../../common/utils/appResponse");
const catchAsync = require("../middlewares/asyncWrapper.middleware");
const { MessageRepository } = require("../repositories/message.repository");

class MessageController {
  // admin function
  deleteUserMessage = catchAsync(async (req, res) => {
    const { userId } = req.body;

    const result = await MessageRepository.deleteUserMessage(userId);

    if (!result) {
      throw new AppError(`Messages for user with id: ${userId} not found`, 404);
    }

    return AppResponse({
      res,
      statusCode: 200,
      message: `Messages for user with id: ${userId} deleted`,
    });
  });

  // admin function
  deleteAllUserMessages = catchAsync(async (req, res) => {
    const result = await MessageRepository.deleteAllUserMessages();

    if (!result) {
      throw new AppError("Failed to delete all messages", 404);
    }

    return AppResponse({
      res,
      statusCode: 200,
      message: "All messages deleted",
    });
  });

  deleteMyMessages = catchAsync(async (req, res) => {
    const user = req.user;

    const result = await MessageRepository.deleteUserMessage(user.id);

    if (!result) {
      throw new AppError(
        `Messages for user with id: ${user.id} not found`,
        404,
      );
    }

    return AppResponse({
      res,
      statusCode: 200,
      message: `Messages for user with id: ${user.id} deleted`,
    });
  });
}

module.exports = { MessageController: new MessageController() };
