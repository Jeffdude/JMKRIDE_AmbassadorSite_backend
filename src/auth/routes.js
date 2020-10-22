const config = require('../config.js');

const DebugMiddleware = require('../middleware/debug.js');
const UsersMiddleware = require('../middleware/users.js');
const ValidationMiddleware = require('../middleware/validation.js');

const AuthController = require('./controller.js');


exports.configRoutes = (app) => {
  app.post('/api/v1/auth', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validateCleanBodyFields(['email', 'password']),
    UsersMiddleware.hasAuthValidFields,
    UsersMiddleware.passwordAndUserMatch,
    AuthController.login
  ]);

  app.post('/api/v1/auth/refresh', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validateCleanBodyFields(['refresh_token']),
    ValidationMiddleware.validJWTNeeded,
    ValidationMiddleware.verifyRefreshBodyField,
    ValidationMiddleware.validRefreshNeeded,
    AuthController.login
  ]);
};
