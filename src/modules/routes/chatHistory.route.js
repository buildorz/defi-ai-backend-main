const {
  validateRequestQuery,
  validateRequestBody
} = require('../../common/joi/base.joi');
const {
  getUserChatHistoryInputSchema,
  addChatHistoryInputSchema
} = require('../../common/joi/chatHistory.joi');
const {
  ChatHistoryController
} = require('../controllers/chatHistory.controller');
const { authenticate } = require('../middlewares/authenticate.middleware');

const router = require('express').Router();

router.get(
  '/',
  validateRequestQuery(getUserChatHistoryInputSchema),
  authenticate,
  ChatHistoryController.getUserChatHistoryPaginated
);

router.post(
  '/',
  validateRequestBody(addChatHistoryInputSchema),
  authenticate,
  ChatHistoryController.addChatHistory
);

router.delete('/', authenticate, ChatHistoryController.deleteUserChatHistory);

module.exports = { ChatHistoryRouter: router };
