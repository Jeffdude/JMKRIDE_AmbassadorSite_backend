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
  app.get('/api/v1/challenges', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.mustBeAmbassadorUnlessThisIsAmbassadorApplication,
    ChallengeController.getChallenge
  ]);
  app.post('/api/v1/challenges/id/:challengeId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.mustBeAmbassadorUnlessThisIsAmbassadorApplication,
    ChallengeController.submitChallenge
  ]);

  /* Submissions Interface - USER & AMBASSADOR */
  app.get('/api/v1/challenges/submissions_allowed/id/:challengeId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.mustBeAmbassadorUnlessThisIsAmbassadorApplication,
    ChallengeController.submissionAllowed
  ]);
  app.get('/api/v1/challenges/submissions', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.mustBeAmbassadorUnlessThisIsAmbassadorApplication,
    ChallengeController.getSubmissions
  ]);
  app.delete('/api/v1/challenges/submissions/id/:submissionId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
    ChallengeController.deleteSubmission
  ]);
  app.get('/api/v1/challenges/submissions/all', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.AMBASSADOR),
    ChallengeController.listSubmissions
  ]);
  app.post('/api/v1/challenges/submissions/update/id/:submissionId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    ChallengeController.updateSubmission
  ]);
  app.get('/api/v1/challenges/submissions/pending', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.ADMIN),
    ChallengeController.getPendingSubmissions
  ]);

  /* Ambassador Application */
  app.get('/api/v1/challenges/ambassador-application', [
    ValidationMiddleware.validJWTNeeded,
    ChallengeController.getAmbassadorApplication
  ]);
  app.get('/api/v1/challenges/submissions/ambassador-application', [
    ValidationMiddleware.validJWTNeeded,
    ChallengeController.getAmbassadorApplicationSubmission
  ]);
}
