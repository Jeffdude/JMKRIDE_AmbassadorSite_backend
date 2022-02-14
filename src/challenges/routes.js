const PERMISSION_LEVELS = require('../constants.js').permissionLevels;

const PermissionMiddleware = require('../middleware/permission.js');
const ValidationMiddleware = require('../middleware/validation.js');

const ChallengeController = require('./controller.js');


exports.configRoutes = (app) => {
  /* Challenge creation endpoints - ADMIN only */
  app.get('/api/v1/challenges/fields', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    ChallengeController.getChallengeFields
  ]);
  app.post('/api/v1/challenges/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    ChallengeController.createChallenge
  ]);

  /* Challenge Interface - USER & AMBASSADOR */
  app.get('/api/v1/challenges/list', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    ChallengeController.listChallenges
  ]);
  app.get('/api/v1/challenges/id/:challengeId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.mustBeAmbassadorUnlessThisIsAmbassadorApplication,
    ChallengeController.getChallenge
  ]);
  app.post('/api/v1/challenges/id/:challengeId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.mustBeAmbassadorUnlessThisIsAmbassadorApplication,
    ChallengeController.submitChallenge
  ]);

  app.delete('/api/v1/submissions/id/:submissionId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    ChallengeController.deleteSubmission
  ])

  /* Ambassador Application */
  app.get('/api/v1/challenges/ambassadorApplication', [
    ValidationMiddleware.validJWTNeeded,
    ChallengeController.getAmbassadorApplication
  ]);
}
