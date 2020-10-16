const config = require('../config.js');

const UsersMiddleware = require('./users-middleware.js');
const AuthValidationMiddleware = require('./validation-middleware.js');

const AuthController = require('./authController.js');



exports.configureAuthRoutes = (app) => {
  app.post('/auth', [
    UsersMiddleware.hasAuthValidFields,
    UsersMiddleware.passwordAndUserMatch,
    AuthController.login
  ]);

  app.post('/auth/refresh', [
    AuthValidationMiddleware.validJWTNeeded,
    AuthValidationMiddleware.verifyRefreshBodyField,
    AuthValidationMiddleware.validRefreshNeeded,
    AuthController.login
  ]);
};
