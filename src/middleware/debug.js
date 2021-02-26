const { logVerboseDebug, logDebug } = require('../modules/errors.js');

exports.printRequest = (req, res, next) => {
  logVerboseDebug("[DEBUG] Received request:", req);
  return next();
}

exports.printJWT = (req, res, next) => {
  logDebug("[DEBUG] JWT:", req.jwt);
  return next();
}

exports.printBody = (req, res, next) => {
  logDebug("[DEBUG] req.body:", req.body);
  return next();
}
