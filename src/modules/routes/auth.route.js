const { signUpOrLoginInputSchema } = require('../../common/joi/auth.joi');
const { validateRequestBody } = require('../../common/joi/base.joi');
const { AuthController } = require('../controllers/auth.controller');

const router = require('express').Router();

router.post(
  '/authenticate',
  validateRequestBody(signUpOrLoginInputSchema),
  AuthController.signUpOrLogin
);

module.exports = { AuthRouter: router };
