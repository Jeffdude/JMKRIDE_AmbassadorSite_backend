const { permissionLevels } = require('../constants.js');

const PermissionMiddleware = require('../middleware/permission.js');
const ValidationMiddleware = require('../middleware/validation.js');

const FriendsController = require('./controller.js');


exports.configRoutes = (app) => {
  app.post('/api/v1/friends/request/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(permissionLevels.USER),
    ValidationMiddleware.validateMandatoryBodyFields(['toUserId']),
    FriendsController.createRequest
  ]);
  app.get('/api/v1/friends/request/incoming', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(permissionLevels.USER),
    FriendsController.getIncomingRequests
  ]);
  app.post('/api/v1/friends/request/accept/id/:requestId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(permissionLevels.USER),
    FriendsController.acceptRequest
  ]);
  app.post('/api/v1/friends/request/reject/id/:requestId', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(permissionLevels.USER),
    FriendsController.rejectRequest
  ]);
}