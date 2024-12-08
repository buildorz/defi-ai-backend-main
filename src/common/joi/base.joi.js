const catchAsync = require('../../modules/middlewares/asyncWrapper.middleware');
const { JoiValidationError } = require('../utils/appError');

const validateRequestBody = (schema) =>
  catchAsync(async (req, res, next) => {
    const result = schema.validate(req.body, {
      convert: true
    });

    if (result.error) {
      throw new JoiValidationError(result.error);
    }

    req.body = result.value;
    next();
  });

const validateRequestParams = (schema) =>
  catchAsync(async (req, res, next) => {
    const result = schema.validate(req.params);

    if (result.error) {
      throw new JoiValidationError(result.error);
    }

    next();
  });

const validateRequestQuery = (schema) => catchAsync(async (req, res, next) => {
  const result = schema.validate(req.query);

  if (result.error) {
    throw new JoiValidationError(result.error);
  }

  next();
})

module.exports = {
  validateRequestBody,
  validateRequestParams,
  validateRequestQuery,
};
