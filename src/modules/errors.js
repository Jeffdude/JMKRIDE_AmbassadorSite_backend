const { processMode, operationMode } = require('../environment.js');
const { loggingLevels } = require('../constants.js');
const { loggingLevel } = require('../config.js');

const loggingMode = loggingLevel[processMode][operationMode];

/*
 * Fn postfixed functions should be used in .catch() blocks
 */
exports.sendAndPrintErrorFn = (res) => (error) => {
  if(operationMode !== "unittest"){
    console.log("[!][500] Caught error:", error);
  }
  return res.status(500).send({error: error.message});
}

exports.printErrorFn = (res) => (error) => {
  if(operationMode !== "unittest"){
    console.log("[!][500] Caught error:", error);
  }
  return res.status(500).send();
}

/*
 * Non-Fn postfixed should be used in } catch (err) { blocks
 */
exports.sendAndPrintError = (res, error) => {
  if(operationMode !== "unittest"){
    console.log("[!][500] Caught error:", error);
  }
  return res.status(500).send({error: error.message});
}

exports.sendError = (res, error) => {
  if(operationMode !== "unittest"){
    console.log("[!][500] Caught error:", error);
  }
  return res.status(500).send();
}

exports.logVerboseDebug = (...args) => {
  if(loggingMode >= loggingLevels.VERBOSE_DEBUG) {
    console.log(...args);
  }
}

exports.logInfo = (...args) => {
  if(loggingMode >= loggingLevels.INFO) {
    console.log(...args);
  }
}

exports.logDebug = (...args) => {
  if(loggingMode >= loggingLevels.DEBUG) {
    console.log(...args);
  }
}

exports.logError = (...args) => {
  if(loggingMode >= loggingLevels.ERRORS) {
    console.log(...args);
  }
}
