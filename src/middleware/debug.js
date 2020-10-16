const debug_enabled = require('../config.js').debug;

exports.printRequest = (req, res, next) => {
  if (!debug_enabled) {
    return next()
  }

  console.log("Received request:", req);
  next();
};
