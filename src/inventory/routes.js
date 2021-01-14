const PERMISSION_LEVELS = require('../config.js').permissionLevels;

const DebugMiddleware = require('../middleware/debug.js');
const PermissionMiddleware = require('../middleware/permission.js');
const ValidationMiddleware = require('../middleware/validation.js');

const InventoryController = require('./controller.js');

exports.configRoutes = (app) => {
  /* Parts Interface */
  app.post('/api/v1/parts/create', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    InventoryController.createPart
  ]);
};

