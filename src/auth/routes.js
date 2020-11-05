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
    DebugMiddleware.printBody,
    AuthController.login
  ]);

  app.post('/api/v1/auth/refresh', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validateCleanBodyFields(['refresh_token']),
    ValidationMiddleware.validJWTNeeded,
    DebugMiddleware.printJWT,
    ValidationMiddleware.verifyRefreshBodyField,
    ValidationMiddleware.validRefreshNeeded,
    DebugMiddleware.printBody,
    AuthController.login
  ]);

  app.get('/api/v1/auth/sessions', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    AuthController.get_sessions
  ]);

  app.post('/api/v1/auth/sessions/disable-all', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    AuthController.disable_all_sessions
  ]);

  app.post('/api/v1/auth/sessions/disable/:sessionId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    AuthController.disable_session
  ]);
};
