const { validateRequestBody } = require("../../common/joi/base.joi");
const { MessageController } = require("../controllers/message.controller");
const {
  deleteUserMessageInputSchema,
} = require("../../common/joi/message.joi");
const { authenticate } = require("../middlewares/authenticate.middleware");

const router = require("express").Router();

router.post(
  "/delete-user-message",
  validateRequestBody(deleteUserMessageInputSchema),
  MessageController.deleteUserMessage,
);

router.post(
  "/delete-all-users-message",
  MessageController.deleteAllUserMessages,
);

router.delete("/my-messages", authenticate, MessageController.deleteMyMessages);

module.exports = { MessageRouter: router };
