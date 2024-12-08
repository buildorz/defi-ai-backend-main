const { prismaClientService } = require('../../../prisma/prisma-client');
const { ErrorHandler } = require('../../common/utils/appError');

class UserRepository {
  async getUserById(id) {
    try {
      return prismaClientService.users.findFirst({
        where: {
          id
        }
      });
    } catch (error) {
      ErrorHandler.dbErrors(error);
    }
  }

  async updateProfile(id, data) {
    try {
      return prismaClientService.users.update({
        where: {
          id
        },
        data
      });
    } catch (error) {
      ErrorHandler.dbErrors(error);
    }
  }
}

module.exports = { UserRepository: new UserRepository() };
