const PERMISSION_LEVELS = require('../constants.js').permissionLevels;

const DebugMiddleware = require('../middleware/debug.js');
const PermissionMiddleware = require('../middleware/permission.js');
const ValidationMiddleware = require('../middleware/validation.js');

const UsersController = require('./controller.js');
const { processMode } = require('../environment.js');

const baseUserRoutes = (app) => {
  app.post('/api/v1/users/create', [
    UsersController.insert
  ]);
  app.get('/api/v1/users/self', [
    ValidationMiddleware.validJWTNeeded,
    DebugMiddleware.printJWT,
    UsersController.lookup,
  ]);
  app.get('/api/v1/users/all', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    UsersController.list({version: 1})
  ]);
  app.get('/api/v2/users/all', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    UsersController.list({version: 2})
  ]);
  app.get('/api/v1/users/id/:userId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    UsersController.getById({version: 1})
  ]);
  app.get('/api/v2/users/id/:userId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    UsersController.getById({version: 2})
  ]);
  app.patch('/api/v1/users/id/:userId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    UsersController.patchById
  ]);
  app.post('/api/v1/user-settings/user/id/:userId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    UsersController.setUserSettings
  ]);
  app.delete('/api/v1/users/id/:userId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    PermissionMiddleware.sameUserCantDoThisAction,
    UsersController.removeById
  ]);
}

const ambassadorsiteRoutes = (app) => {
  app.get('/api/v1/users/submission_count/id/:userId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    UsersController.getSubmissionCountById
  ]);
}

const stockTrackerRoutes = (app) => {
  app.post('/api/v1/users/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    UsersController.insert
  ]);
  app.post('/api/v1/users/defaults/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    UsersController.setDefaultInventory
  ]);
  app.post('/api/v1/users/defaults/categoryset/id/:categorySetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    UsersController.setDefaultCategorySet
  ]);
  app.post('/api/v1/users/defaults/csset/id/:CSSetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    UsersController.setDefaultCSSet
  ]);
}

const processModeRoutes = {
  "stocktracker": (app) => {
    baseUserRoutes(app);
    stockTrackerRoutes(app);
  },
  "ambassadorsite": (app) => {
    baseUserRoutes(app);
    ambassadorsiteRoutes(app);
  },
}

exports.configRoutes = (app) => 
  processModeRoutes[processMode](app)
