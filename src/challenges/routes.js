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
  app.get('/api/v1/challenges/all', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    ChallengeController.getAllChallenges
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

  app.get('/api/v1/submissions/pending', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    ChallengeController.getPendingSubmissions
  ])
  app.get('/api/v1/submissions/all', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    ChallengeController.getAllSubmissions
  ])
  app.get('/api/v1/submission/id/:submissionId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    ChallengeController.getSubmission
  ])
  app.post('/api/v1/submission/id/:submissionId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    ChallengeController.updateSubmission
  ])

  app.delete('/api/v1/submission/id/:submissionId', [
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
