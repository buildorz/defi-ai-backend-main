const { ChatHistoryRoleEnum } = require('@prisma/client');
const Joi = require('joi');

const getUserChatHistoryInputSchema = Joi.object({
  page: Joi.number().optional(),
  limit: Joi.number().optional()
});

const addChatHistoryInputSchema = Joi.object({
  message: Joi.string().required(),
  role: Joi.string()
    .required()
    .valid(...Object.values(ChatHistoryRoleEnum))
});

module.exports = {
  getUserChatHistoryInputSchema,
  addChatHistoryInputSchema
};
