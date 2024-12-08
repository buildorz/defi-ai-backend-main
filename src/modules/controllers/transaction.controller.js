const { AppError } = require('../../common/utils/appError');
const { AppResponse } = require('../../common/utils/appResponse');
const catchAsync = require('../middlewares/asyncWrapper.middleware');
const {
  TransactionRepository
} = require('../repositories/transaction.repository');

class TransactionController {
  getAll = catchAsync(async (req, res) => {
    const result = await TransactionRepository.getAll();

    return AppResponse({
      res,
      statusCode: 200,
      data: result || []
    });
  });

  addRecord = catchAsync(async (req, res) => {
    const { user_id, type, tx_hash } = req.body;

    if (!user_id || !type || !tx_hash) {
      throw new AppError('user_id, type and tx_hash are required', 400);
    }

    const result = await TransactionRepository.addRecord(req.body);

    if (!result) {
      throw new AppError('Failed to add record', 400);
    }

    return AppResponse({
      res,
      statusCode: 201,
      data: result
    });
  });
}

module.exports = { TransactionController: new TransactionController() };
