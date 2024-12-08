const Joi = require('joi');

const deleteUserMessageInputSchema = Joi.object({
  userId: Joi.string().required()
});

module.exports = {
  deleteUserMessageInputSchema
};
