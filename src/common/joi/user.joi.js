const Joi = require('joi');

const updateProfileInputSchema = Joi.object({
  username: Joi.string().optional()
});

const getAllUsersInputSchema = Joi.object({
  walletBlockchain: Joi.string().optional(),
  page: Joi.number().optional(),
  size: Joi.number().optional()
});

module.exports = {
  updateProfileInputSchema,
  getAllUsersInputSchema
};
