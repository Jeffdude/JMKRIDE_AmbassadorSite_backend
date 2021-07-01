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
    UsersController.list
  ]);
  app.get('/api/v1/users/id/:userId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    UsersController.getById
  ]);
  app.patch('/api/v1/users/id/:userId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    UsersController.patchById
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
