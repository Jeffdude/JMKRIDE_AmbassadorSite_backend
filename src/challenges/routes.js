const PERMISSION_LEVELS = require('../config.js').permissionLevels;

const DebugMiddleware = require('../middleware/debug.js');
const PermissionMiddleware = require('../middleware/permission.js');
const ValidationMiddleware = require('../middleware/validation.js');

const ChallengeController = require('./controller.js');


exports.configRoutes = (app) => {
  app.post('/api/v1/challenges/create', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    ChallengeController.create
  ]);
  app.get('/api/v1/challenges/ambassador-application', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    ChallengeController.getAmbassadorApplication
  ]);
  app.get('/api/v1/challenges/all', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    ChallengeController.list
  ]);
  app.get('/api/v1/challenges/id/:challengeId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    ChallengeController.getById
  ]);
  app.post('/api/v1/challenges/id/:challengeId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    ChallengeController.submitChallenge
  ]);
}
