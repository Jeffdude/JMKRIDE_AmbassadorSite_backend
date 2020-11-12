const PERMISSION_LEVELS = require('../config.js').permissionLevels;

const DebugMiddleware = require('../middleware/debug.js');
const PermissionMiddleware = require('../middleware/permission.js');
const ValidationMiddleware = require('../middleware/validation.js');

const ChallengeController = require('./controller.js');


exports.configRouters = (app) => {
  app.post('/api/v1/challenges/create', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    ChallengeController.create
  ]);
}
