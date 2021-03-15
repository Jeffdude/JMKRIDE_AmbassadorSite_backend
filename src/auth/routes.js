const DebugMiddleware = require('../middleware/debug.js');
const UsersMiddleware = require('../middleware/users.js');

const PERMISSION_LEVELS = require('../constants.js').permissionLevels;

const ValidationMiddleware = require('../middleware/validation.js');
const PermissionMiddleware = require('../middleware/permission.js');

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

  /* ----------------------- Sessions ----------------------- */

  app.get('/api/v1/auth/sessions/self', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    AuthController.get_user_sessions
  ]);

  app.delete('/api/v1/auth/sessions/all', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    AuthController.disable_all_sessions
  ]);

  app.post('/api/v1/auth/email_verification', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    AuthController.createAndSendEmailVerificationToken
  ]);
  app.delete('/api/v1/auth/sessions/self', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    DebugMiddleware.printJWT,
    AuthController.disable_current_session
  ]);

  app.get('/api/v1/auth/sessions/id/:sessionId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    AuthController.get_session
  ]);

  app.delete('/api/v1/auth/sessions/id/:sessionId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    AuthController.disable_session
  ]);

  app.post('/api/v1/auth/email-verification/create', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    AuthController.createAndSendEmailVerificationToken
  ]);

  app.post('/api/v1/auth/email-verification/verify', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    AuthController.verifyEmailVerificationToken
  ]);

};
