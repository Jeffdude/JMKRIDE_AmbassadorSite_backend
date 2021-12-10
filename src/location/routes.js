const ValidationMiddleware = require('../middleware/validation.js');
const PermissionMiddleware = require('../middleware/permission.js');
const PERMISSION_LEVELS = require('../constants.js').permissionLevels;
const { googleMapsApiKey } = require('../environment.js');

const locationController = require('./controller.js');
const locationConstants = require('./constants.js');

exports.configRoutes = (app) => {
  app.get('/api/v1/location/googleMapsKey', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    (_, res) => res.status(200).send({result: googleMapsApiKey})
  ]);
  app.get('/api/v1/location/countries', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    (_, res) => res.status(200).send({result: locationConstants.allCountries})
  ]);
  app.post('/api/v1/location/lookup', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    ValidationMiddleware.validateMandatoryBodyFields(['country', 'zip']),
    locationController.lookupLocation
  ]);
  app.post('/api/v1/location/create', [
    ValidationMiddleware.validJWTNeeded,
    PermissionMiddleware.minimumPermissionLevelRequired(PERMISSION_LEVELS.USER),
    ValidationMiddleware.validateMandatoryBodyFields(['lat', 'lng', 'country', 'zip']),
    locationController.createLocationAndAddToUser
  ]);
}