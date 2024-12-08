const { prismaClientService } = require('../../../prisma/prisma-client');
const { ErrorHandler } = require('../../common/utils/appError');

class TransactionRepository {
  async addRecord(payload) {
    try {
      return await prismaClientService.transactions.create({
        data: payload
      });
    } catch (error) {
      ErrorHandler.dbErrors(error);
    }
  }

  async getAll() {
    try {
      return await prismaClientService.transactions.findMany();
    } catch (error) {
      ErrorHandler.dbErrors(error);
    }
  }
}

module.exports = { TransactionRepository: new TransactionRepository() };
