const { prismaClientService } = require("../../../prisma/prisma-client");
const jwt = require("jsonwebtoken");
const { ENVIRONMENT } = require("../../common/utils/environment");
const { AppError } = require("../../common/utils/appError");
const catchAsync = require("../../modules/middlewares/asyncWrapper.middleware");

const authenticate = catchAsync(async (req, res, next) => {
  if (!req.header("Authorization")) {
    return next(new AppError("You don't have a token", 401));
  }

  const token = req.header("Authorization").replace("Bearer ", "");

  try {
    const response =  await jwt.verify(token, ENVIRONMENT.JWT.SECRET);
    req.token = token;

    const user = await prismaClientService.users.findFirst({
      where: {
        id: response.id,
      },
    });

    if (!user) {
      return next(new AppError("Invalid token", 404));
    }

    req.user = user;

    next();
  } catch (err) {
    return next(new AppError(err.message, 401));
  }
});

module.exports = { authenticate };
