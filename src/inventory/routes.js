const PERMISSION_LEVELS = require('../constants.js').permissionLevels;

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

  app.patch('/api/v1/parts/id/:partId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    InventoryController.patchById
  ]);

  app.get('/api/v1/parts/category/id/:categoryId/inventory/id/:inventoryId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getPartsByCategory
  ]);

  app.get('/api/v1/categories/categorySet/id/:categorySetId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getCategoriesByCategorySet
  ]);

  app.get('/api/v1/categorySets/all', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getAllCategorySets
  ]);

  app.get('/api/v1/inventories/all', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getAllInventories
  ]);

  app.get('/api/v1/categorysets/id/:categorySetId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getCategorySetById
  ]);

  app.get('/api/v1/categorysets/categories/id/:categorySetId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getCategoriesByCategorySet
  ]);


  app.get('/api/v1/parts/debug', [
    DebugMiddleware.printRequest,
    InventoryController.debug
  ]);
};

