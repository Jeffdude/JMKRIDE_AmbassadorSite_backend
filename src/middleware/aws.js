const { logInfo, logError } = require('../modules/errors.js');

exports.reformatBody = (formatObj) => (req, res, next) => {
  console.log(formatObj);
  console.log(req);
  next();
}