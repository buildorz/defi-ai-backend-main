const Joi = require("joi");

const signUpOrLoginInputSchema = Joi.object({
  wallet: Joi.string().required(),
  username: Joi.string().optional(),
});

module.exports = {
  signUpOrLoginInputSchema,
};
