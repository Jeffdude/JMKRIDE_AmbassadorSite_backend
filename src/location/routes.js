const ValidationMiddleware = require('../middleware/validation.js');
const PermissionMiddleware = require('../middleware/permission.js');
const PERMISSION_LEVELS = require('../constants.js').permissionLevels;
const { googleMapsApiKey } = require('../environment.js');

exports.configRoutes = (app) => {
  app.get('/api/v1/location/googleMapsKey',
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    (_, res) => res.status(200).send({result: googleMapsApiKey})
  )
}