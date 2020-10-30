const debug_enabled = require('../config.js').debug;

exports.printRequest = (req, res, next) => {
  if (debug_enabled) {
    console.log("[DEBUG] Received request:", req);
  }

  next();
}

exports.printJWT = (req, res, next) => {
  if (debug_enabled) {
    console.log("[DEBUG] JWT:", req.jwt);
  }
  next();
}
