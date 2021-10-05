const PERMISSION_LEVELS = require('../constants.js').permissionLevels;

const DebugMiddleware = require('../middleware/debug.js');
const PermissionMiddleware = require('../middleware/permission.js');
const ValidationMiddleware = require('../middleware/validation.js');

const InventoryController = require('./controller.js');

exports.configRoutes = (app) => {

  /* Part Routes */

  app.post('/api/v1/part/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    InventoryController.createPart
  ]);
  app.post('/api/v1/part/create/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.createPart
  ]);
  app.get('/api/v1/part/id/:partId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getPart
  ]);
  app.delete('/api/v1/part/id/:partId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.deletePart
  ]);
  app.get('/api/v1/part/id/:partId/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getPartWithQuantity
  ]);
  app.get('/api/v1/part/all/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getAllPartsWithQuantity
  ]);
  app.post('/api/v1/part/search/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.searchAllPartsWithQuantity
  ]);
  app.post('/api/v1/part/id/:partId/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    ValidationMiddleware.validateMandatoryBodyFields(['quantity']),
    InventoryController.updatePartQuantity
  ]);
  app.patch('/api/v1/part/id/:partId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.patchPart
  ]);

  /* Category Routes */

  app.get('/api/v1/category/id/:categoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getCategory
  ]);
  app.post('/api/v1/category/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.createCategory
  ]);
  app.post('/api/v1/category-order/id/:categoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.setCategoryPartOrder
  ]);
  app.patch('/api/v1/category/id/:categoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.patchCategory
  ]);
  app.delete('/api/v1/category/id/:categoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.deleteCategory
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
  app.get('/api/v1/categories/all', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getAllCategories
  ]);

  app.get('/api/v1/inventories/all', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getAllInventories
  ]);

  /* CategorySets Routes */

  app.get('/api/v1/categorySets/all', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getAllCategorySets
  ]);
  app.post('/api/v1/categorySet/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.createCategorySet
  ]);
  app.get('/api/v1/categorySet/id/:categorySetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getCategorySetById
  ]);
  app.patch('/api/v1/categorySet/id/:categorySetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.patchCategorySet
  ]);
  app.post('/api/v1/categorySet-order/id/:categorySetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.setCategorySetOrder
  ]);
  app.delete('/api/v1/categorySet/id/:categorySetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.deleteCategorySet
  ]);
  app.get('/api/v1/categorySets/categories/id/:categorySetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getCategoriesByCategorySet
  ]);

  /* Logs Routes */

  app.get('/api/v1/logs/category/id/:categoryId/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getLogsByCategory
  ]);
  app.get('/api/v1/logs/part/id/:partId/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getLogsByPart
  ]);
  app.get('/api/v1/logs/user/id/:userId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getLogsByUser
  ]);
  app.get('/api/v1/logs/all/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getAllLogs
  ]);

  /* CompleteSet Routes */

  app.get('/api/v1/completesets/csset/id/:CSSetId/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getCompleteSetsByCSSetId
  ]);
  app.get('/api/v1/completesets/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getCompleteSets
  ]);
  app.get('/api/v1/completeset/id/:completeSetId/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getCompleteSetById
  ]);
  app.post('/api/v1/completeset/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.createCompleteSet
  ]);
  app.post('/api/v1/completeset/withdraw-custom/inventory/id/:inventoryId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.createAndWithdrawCustomCompleteSet
  ]);
  app.patch('/api/v1/completeset/id/:completeSetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.patchCompleteSet
  ]);
  app.post('/api/v1/completeset/id/:completeSetId/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    ValidationMiddleware.validateMandatoryBodyFields(['quantity']),
    InventoryController.updateCompleteSetQuantity
  ]);
  app.delete('/api/v1/completeset/id/:completeSetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.deleteCS
  ]);
  app.get('/api/v1/cssets/all', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getAllCSSets
  ]);
  app.post('/api/v1/csset/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.createCSSet
  ]);
  app.get('/api/v1/csset/id/:CSSetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getCSSetById
  ]);
  app.patch('/api/v1/csset/id/:CSSetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.patchCSSet
  ]);
  app.delete('/api/v1/csset/id/:CSSetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.deleteCSSet
  ]);
  app.post('/api/v1/csset-order/id/:CSSetId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.setCSSetCSOrder
  ]);

  /* Inventory Routes */
  app.post('/api/v1/inventory/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.createInventory
  ]);
  app.get('/api/v1/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getInventoryById
  ]);
  app.get('/api/v1/inventories/all', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    InventoryController.getAllInventories
  ]);
  app.patch('/api/v1/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.patchInventory
  ]);
  app.delete('/api/v1/inventory/id/:inventoryId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    InventoryController.deleteInventory
  ]);

  app.post('/api/v1/inventory/debug', [
    ValidationMiddleware.validJWTNeeded,
    InventoryController.debug
  ]);
};

