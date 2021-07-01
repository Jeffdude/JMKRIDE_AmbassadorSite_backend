const PERMISSION_LEVELS = require('../constants.js').permissionLevels;

const DebugMiddleware = require('../middleware/debug.js');
const PermissionMiddleware = require('../middleware/permission.js');
const ValidationMiddleware = require('../middleware/validation.js');

const InventoryController = require('./controller.js');

exports.configRoutes = (app) => {
  /* Parts Interface */
  app.post('/api/v1/parts/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    InventoryController.createPart
  ]);

  app.get('/api/v1/part/id/:partId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getPart
  ]);
  app.get('/api/v1/part/id/:partId/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getPartWithQuantity
  ]);
  app.post('/api/v1/part/id/:partId/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    ValidationMiddleware.validateMandatoryBodyFields(['quantity']),
    InventoryController.updatePartQuantity
  ]);

  app.patch('/api/v1/part/id/:partId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    InventoryController.patchPart
  ]);

  app.get('/api/v1/category/id/:categoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getCategory
  ]);
  app.post('/api/v1/category/id/:categoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.setCategoryPartOrder
  ]);

  app.get('/api/v1/parts/category/id/:categoryId/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getPartsByCategory
  ]);
  app.get('/api/v1/categories/categorySet/id/:categorySetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getCategoriesByCategorySet
  ]);

  app.get('/api/v1/categorySets/all', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getAllCategorySets
  ]);

  app.get('/api/v1/inventories/all', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getAllInventories
  ]);

  app.get('/api/v1/categorysets/id/:categorySetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getCategorySetById
  ]);

  app.get('/api/v1/categorysets/categories/id/:categorySetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getCategoriesByCategorySet
  ]);

  app.get('/api/v1/logs/category/id/:categoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getLogsByCategory
  ]);
  app.get('/api/v1/logs/part/id/:partId', [
    ValidationMiddleware.validJWTNeeded,
    DebugMiddleware.printRequest,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getLogsByPart
  ]);


  app.get('/api/v1/parts/debug', [
    InventoryController.debug
  ]);
};

