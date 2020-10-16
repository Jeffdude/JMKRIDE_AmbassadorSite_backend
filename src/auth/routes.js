const config = require('../config.js');

const DebugMiddleware = require('../middleware/debug.js');
const UsersMiddleware = require('../middleware/users.js');
const AuthValidationMiddleware = require('../middleware/validation.js');

const AuthController = require('./authController.js');


exports.configRoutes = (app) => {
  app.post('/auth', [
    DebugMiddleware.printRequest,
    UsersMiddleware.hasAuthValidFields,
    UsersMiddleware.passwordAndUserMatch,
    AuthController.login
  ]);

  app.post('/auth/refresh', [
    DebugMiddleware.printRequest,
    AuthValidationMiddleware.validJWTNeeded,
    AuthValidationMiddleware.verifyRefreshBodyField,
    AuthValidationMiddleware.validRefreshNeeded,
    AuthController.login
  ]);
};
