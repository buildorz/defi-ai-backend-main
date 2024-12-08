const { prismaClientService } = require("../../../prisma/prisma-client");
const { AppResponse } = require("../../common/utils/appResponse");
const catchAsync = require("../middlewares/asyncWrapper.middleware");
const jwt = require("jsonwebtoken");
const { AppError } = require("../../common/utils/appError");
const { ENVIRONMENT } = require("../../common/utils/environment");
const { BaseHelper } = require("../../common/utils/helper");

class AuthController {
  signUpOrLogin = catchAsync(async (req, res) => {
    const { wallet, username } = req.body;

    if (!BaseHelper.isValidEthereumPublicKey(wallet)) {
      throw new AppError("Invalid Ethereum address", 400);
    }

    let user;
    let token;

    user = await prismaClientService.users.findFirst({
      where: {
        wallet,
      },
    });

    if (!user) {
      if (!wallet) {
        throw new AppError("Invalid data, wallet address is required", 400);
      }

      user = await prismaClientService.users.create({
        data: {
          wallet,
          username,
        },
      });

      token = jwt.sign(
        {
          id: user.id,
          wallet: user.wallet,
        },
        ENVIRONMENT.JWT.SECRET,
      );
    } else {
      token = jwt.sign(
        {
          id: user.id,
          wallet: user.wallet,
        },
        ENVIRONMENT.JWT.SECRET,
      );
    }

    return AppResponse({
      res,
      data: { ...user, token },
      message: "Authentication Successful",
    });
  });
}

module.exports = { AuthController: new AuthController() };
