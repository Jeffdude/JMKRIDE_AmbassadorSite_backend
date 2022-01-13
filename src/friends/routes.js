const { permissionLevels } = require('../constants.js');

const PermissionMiddleware = require('../middleware/permission.js');
const ValidationMiddleware = require('../middleware/validation.js');

const FriendsController = require('./controller.js');


exports.configRoutes = (app) => {
  app.post('/api/v1/friends/request/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(permissionLevels.USER),
    ValidationMiddleware.validateMandatoryBodyFields([
      'fromUserId', 'toUserId',
    ]),
    FriendsController.createRequest
  ]);
  app.post('/api/v1/friends/request/incoming/get', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(permissionLevels.USER),
    FriendsController.getIncomingRequests
  ]);
  app.post('/api/v1/friends/request/outgoing/get', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(permissionLevels.USER),
    FriendsController.getOutgoingRequests
  ]);
}