const { permissionLevels } = require('../constants.js');

const PermissionMiddleware = require('../middleware/permission.js');
const ValidationMiddleware = require('../middleware/validation.js');
const UsersMiddleware = require('../middleware/users.js');
const DebugMiddleware = require('../middleware/debug.js');
const ShopifyMiddleware = require('../middleware/shopify.js');

const TransactionController = require('./controller.js');


exports.configRoutes = (app) => {
  /* Transactions endpoints */
  app.get('/api/v1/transactions/get', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(permissionLevels.AMBASSADOR),
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    TransactionController.getTransactions
  ]);
  app.post('/api/v1/transactions/admin/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(permissionLevels.ADMIN),
    ValidationMiddleware.validateMandatoryBodyFields([
      'amount', 'user', 'reason'
    ]),
    TransactionController.createAdminTransaction
  ]);
  app.post('/api/v1/transactions/admin/recalculateBalance', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(permissionLevels.ADMIN),
    ValidationMiddleware.validateMandatoryBodyFields(['userId']),
    TransactionController.recalculateUserBalance
  ]);
  app.post('/api/v1/transactions/referralCodes/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(permissionLevels.ADMIN),
    ValidationMiddleware.validateMandatoryBodyFields([
      'code', 'percent', 'owner'
    ]),
    TransactionController.createReferralCode
  ]);
  app.post('/api/v1/transactions/referralCodes/usage/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(permissionLevels.ADMIN),
    ValidationMiddleware.validateMandatoryBodyFields([
      'code', 'total', 'orderNumber'
    ]),
    TransactionController.createReferralCodeUsage
  ]);
  app.get('/api/v1/transactions/referralCodes/get', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(permissionLevels.AMBASSADOR),
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    TransactionController.getReferralCodes
  ]);
  app.get('/api/v1/transactions/referralCodes/get/all', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(permissionLevels.ADMIN),
    TransactionController.getAllReferralCodes
  ]);
  app.post('/shopifyAPI/v1/transactions/referralCodes/usage', [
    DebugMiddleware.printRequest,
    ShopifyMiddleware.validShopifyHmac,
    (req, res, next) => {
      if(!req.body.discount_codes.length) return res.status(200).send();
      next();
    },
    ShopifyMiddleware.reformatBody({
      codeName: i => i.discount_codes[0],
      total: i => i.total_price,
      orderNumber: i => i.order_number,
    }),
    ValidationMiddleware.validateMandatoryBodyFields([
      'code', 'total', 'orderNumber'
    ]),
    (req, res) => res.status(201).send({body: req.body})
    //TransactionController.createReferralCodeUsage
  ])
}
