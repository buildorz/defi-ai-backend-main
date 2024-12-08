const { UserRepository } = require("../repositories/user.repository");
const { AppError } = require("../../common/utils/appError");
const { AppResponse } = require("../../common/utils/appResponse");
const catchAsync = require("../middlewares/asyncWrapper.middleware");
const { prismaClientService } = require("../../../prisma/prisma-client");

class UserController {
  getProfile = catchAsync(async (req, res) => {
    const user = await UserRepository.getUserById(req?.user?.id);

    if (!user) {
      throw new AppError(`User not found`, 404);
    }

    return AppResponse({
      res,
      statusCode: 200,
      data: user,
    });
  });

  updateProfile = catchAsync(async (req, res) => {
    const response = await UserRepository.updateProfile(
      req?.user?.id,
      req.body
    );

    if (!response) {
      throw new AppError(`User not found`, 404);
    }

    return AppResponse({
      res,
      statusCode: 200,
      data: response,
    });
  });

  getAllUsers = catchAsync(async (req, res) => {
    let { walletBlockchain, page, size } = req.query;

    page = page || 1;
    size = size || 10;

    const [users, count] = await Promise.all([
      await prismaClientService.users.findMany({
        where: {
          ...(walletBlockchain && { walletBlockchain }),
          deleted_at: null,
        },
        skip: (page - 1) * size,
        take: size,
      }),
      await prismaClientService.users.count({
        where: {
          ...(walletBlockchain && { walletBlockchain }),
          deleted_at: null,
        },
      }),
    ]);

    const pagination = {
      page,
      size,
      total: count,
    };

    return AppResponse({
      res,
      statusCode: 200,
      data: {
        data: users,
        pagination,
      },
    });
  });
}

module.exports = { UserController: new UserController() };
