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
    ChallengeController.getAmbassadorApplication
  ]);
  app.get('/api/v1/challenges/all', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    ChallengeController.listChallenges
  ]);
  app.get('/api/v1/challenges/id/:challengeId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.mustBeAmbassadorUnlessThisIsAmbassadorApplication,
    ChallengeController.getChallenge
  ]);
  app.post('/api/v1/challenges/id/:challengeId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.mustBeAmbassadorUnlessThisIsAmbassadorApplication,
    ChallengeController.submitChallenge
  ]);
  app.get('/api/v1/challenges/submissions_allowed/id/:challengeId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.mustBeAmbassadorUnlessThisIsAmbassadorApplication,
    ChallengeController.submissionAllowed
  ]);
  app.get('/api/v1/challenges/submissions/id/:challengeId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.mustBeAmbassadorUnlessThisIsAmbassadorApplication,
    ChallengeController.getSubmissions
  ]);
  app.get('/api/v1/challenges/submissions/all', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    ChallengeController.listSubmissions
  ]);
}
