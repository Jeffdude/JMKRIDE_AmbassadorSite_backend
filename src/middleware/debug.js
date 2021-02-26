const { logVerboseDebug, logDebug } = require('../modules/errors.js');

const { loggingLevels } = require('../constants.js');
const { processMode, operationMode } = require('../environment.js');
const { loggingLevel } = require('../config.js');

const loggingMode = loggingLevel[processMode][operationMode];

exports.printRequest = (req, res, next) => {
  if(loggingMode >= loggingLevels.VERBOSE_DEBUG) {
    logVerboseDebug("[VERBOSE_DEBUG] Received request:", req);
  } else if (loggingMode >= loggingLevels.DEBUG) {
    logDebug("[DEBUG] Received request:", req.path);
  }
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
