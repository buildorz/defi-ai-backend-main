const { validateRequestBody } = require('../../common/joi/base.joi');
const {
  addTransactionRecordInputSchema
} = require('../../common/joi/transaction.joi');
const {
  TransactionController
} = require('../controllers/transaction.controller');

const router = require('express').Router();

router.get('/all', TransactionController.getAll);

router.post(
  '/add-record',
  [validateRequestBody(addTransactionRecordInputSchema)],
  TransactionController.addRecord
);

module.exports = { TransactionRouter: router };
