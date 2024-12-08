const { AppError } = require("../../common/utils/appError");
const catchAsync = require("./asyncWrapper.middleware");

const roleGuardMiddleware = (...roles) => {
  return catchAsync(async (req, res, next) => {
    const user = req?.user;

    if (!user) {
      throw new AppError("Access denied", 401);
    }

    if (!roles.includes(user?.role?.toLowerCase())) {
      throw new AppError("Access denied", 401);
    }

    next();
  });
};

module.exports = { roleGuardMiddleware };
