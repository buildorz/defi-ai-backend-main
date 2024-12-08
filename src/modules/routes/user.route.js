const { authenticate } = require('../middlewares/authenticate.middleware');
const { UserController } = require('../controllers/user.controller');
const {
  validateRequestBody,
  validateRequestQuery
} = require('../../common/joi/base.joi');
const {
  updateProfileInputSchema,
  getAllUsersInputSchema
} = require('../../common/joi/user.joi');

const router = require('express').Router();

router.get('/profile', authenticate, UserController.getProfile);

router.patch(
  '/profile',
  authenticate,
  validateRequestBody(updateProfileInputSchema),
  UserController.updateProfile
);

router.get(
  '/all-users',
  validateRequestQuery(getAllUsersInputSchema),
  UserController.getAllUsers
);

module.exports = { UserRouter: router };
