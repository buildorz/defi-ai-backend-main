const Joi = require('joi');

const addTransactionRecordInputSchema = Joi.object({
  user_id: Joi.number().required(),
  tx_hash: Joi.string().required(),
  token_in: Joi.string().optional(),
  token_out: Joi.string().optional(),
  amount_to_swap: Joi.number().optional(),
  token_sent: Joi.string().optional(),
  amount_sent: Joi.number().optional(),
  recipient: Joi.string().optional(),
  sender: Joi.string().optional(),
  amount_in_usd: Joi.number().optional(),
  type: Joi.string().valid('SWAP', 'SEND').required()
});

module.exports = {
  addTransactionRecordInputSchema
};
