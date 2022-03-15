const DebugMiddleware = require('../middleware/debug.js');
const UsersMiddleware = require('../middleware/users.js');

const PERMISSION_LEVELS = require('../constants.js').permissionLevels;

const ValidationMiddleware = require('../middleware/validation.js');
const PermissionMiddleware = require('../middleware/permission.js');

const AuthController = require('./controller.js');


exports.configRoutes = (app) => {
  app.post('/api/v1/auth', [
    ValidationMiddleware.validateCleanBodyFields(['email', 'password']),
    UsersMiddleware.hasAuthValidFields,
    UsersMiddleware.passwordAndUserMatch,
    DebugMiddleware.printBody,
    AuthController.login
  ]);

  app.post('/api/v1/auth/refresh', [
    ValidationMiddleware.validateCleanBodyFields(['refresh_token']),
    ValidationMiddleware.validJWTNeeded,
    ValidationMiddleware.verifyRefreshBodyField,
    ValidationMiddleware.validRefreshNeeded,
    DebugMiddleware.printBody,
    AuthController.login
  ]);

  /* ----------------------- Sessions ----------------------- */

  app.get('/api/v1/auth/sessions/self', [
    ValidationMiddleware.validJWTNeeded,
    AuthController.get_user_sessions({version: 1})
  ]);
  app.get('/api/v2/auth/sessions/self', [
    ValidationMiddleware.validJWTNeeded,
    AuthController.get_user_sessions({version: 2})
  ]);

  app.delete('/api/v1/auth/sessions/all', [
    ValidationMiddleware.validJWTNeeded,
    AuthController.disable_all_sessions
  ]);

  app.post('/api/v1/auth/email_verification', [
    ValidationMiddleware.validJWTNeeded,
    AuthController.createAndSendEmailVerificationToken
  ]);
  app.post('/api/v1/auth/reset_password/password', [
    ValidationMiddleware.validJWTNeeded,
    AuthController.resetPasswordWithPassword
  ]);
  app.post('/api/v1/auth/token/password_reset',[
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    ValidationMiddleware.validateMandatoryBodyFields(['userId']),
    AuthController.createPasswordResetToken
  ])
  app.post('/api/v1/auth/reset_password/token/:tokenKey', [
    AuthController.resetPasswordWithToken
  ]);
  app.post('/api/v1/auth/send_reset_password_email',
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    AuthController.resetUserPassword
  )
  app.post('/api/v1/auth/reset_password/admin', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    AuthController.resetUserPassword
  ]);
  app.delete('/api/v1/auth/sessions/self', [
    ValidationMiddleware.validJWTNeeded,
    AuthController.disable_current_session
  ]);

  app.get('/api/v1/auth/sessions/id/:sessionId', [
    ValidationMiddleware.validJWTNeeded,
    AuthController.get_session
  ]);

  app.delete('/api/v1/auth/sessions/id/:sessionId', [
    ValidationMiddleware.validJWTNeeded,
    AuthController.disable_session
  ]);

  app.post('/api/v1/auth/email-verification/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    AuthController.createAndSendEmailVerificationToken
  ]);

  app.post('/api/v1/auth/email-verification/verify', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    AuthController.verifyEmailVerificationToken
  ]);

};
