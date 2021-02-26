const PERMISSION_LEVELS = require('../constants.js').permissionLevels;

const DebugMiddleware = require('../middleware/debug.js');
const PermissionMiddleware = require('../middleware/permission.js');
const ValidationMiddleware = require('../middleware/validation.js');

const ChallengeController = require('./controller.js');


exports.configRoutes = (app) => {
  /* Challenge creation endpoints - ADMIN only */
  app.get('/api/v1/challenges/fields', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    ChallengeController.getChallengeFields
  ]);
  app.post('/api/v1/challenges/create', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    ChallengeController.createChallenge
  ]);

  /* Challenge Interface - USER & AMBASSADOR */
  app.get('/api/v1/challenges/list', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    ChallengeController.listChallenges
  ]);
  app.get('/api/v1/challenges', [
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

  /* Submissions Interface - USER & AMBASSADOR */
  app.get('/api/v1/challenges/submissions_allowed/id/:challengeId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.mustBeAmbassadorUnlessThisIsAmbassadorApplication,
    ChallengeController.submissionAllowed
  ]);
  app.get('/api/v1/challenges/submissions', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.mustBeAmbassadorUnlessThisIsAmbassadorApplication,
    ChallengeController.getSubmissions
  ]);
  app.delete('/api/v1/challenges/submissions/id/:submissionId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    ChallengeController.deleteSubmission
  ]);
  app.get('/api/v1/challenges/submissions/all', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    ChallengeController.listSubmissions
  ]);
  app.post('/api/v1/challenges/submissions/update/id/:submissionId', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    ChallengeController.updateSubmission
  ]);
  app.get('/api/v1/challenges/submissions/pending', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    ChallengeController.getPendingSubmissions
  ]);

  /* Ambassador Application */
  app.get('/api/v1/challenges/ambassador-application', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    ChallengeController.getAmbassadorApplication
  ]);
  app.get('/api/v1/challenges/submissions/ambassador-application', [
    DebugMiddleware.printRequest,
    ValidationMiddleware.validJWTNeeded,
    ChallengeController.getAmbassadorApplicationSubmission
  ]);
}
