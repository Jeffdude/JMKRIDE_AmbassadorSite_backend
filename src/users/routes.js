const PERMISSION_LEVELS = require('../config.js').permissionLevels;

const DebugMiddleware = require('../middleware/debug.js');
const PermissionMiddleware = require('../middleware/permission.js');
const ValidationMiddleware = require('../middleware/validation.js');

const UsersController = require('./controller.js');


exports.configRoutes = (app) => {
  app.post('/api/v1/users', [
    DebugMiddleware.printRequest,
    UsersController.insert
  ]);
  app.get('/api/v1/user-lookup', [
    ValidationMiddleware.validJWTNeeded,
    UsersController.lookup,
  ]);
  app.get('/api/v1/users', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    UsersController.list
  ]);
  app.get('/api/v1/users/:userId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    UsersController.getById
  ]);
  app.patch('/api/v1/users/:userId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    UsersController.patchById
  ]);
  app.delete('/api/v1/users/:userId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    PermissionMiddleware.sameUserCantDoThisAction,
    UsersController.removeById
  ]);
};
