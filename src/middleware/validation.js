const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const jwt_secret = require('../environment.js').JWTSecret;
const sessionModel = require('../auth/model.js');
const { logError } = require('../modules/errors.js');

exports.verifyRefreshBodyField = (req, res, next) => {
  if (req.body && req.body.refresh_token) {
    return next();
  } else {
    return res.status(400).send({error: 'need to pass refresh_token field'});
  }
};

exports.validRefreshNeeded = (req, res, next) => {
  let refresh_token = Buffer.from(req.body.refresh_token, 'base64').toString();
  let refresh_id = req.jwt.userId + jwt_secret;
  let hash = crypto.createHmac('sha512', req.jwt.refreshKey).update(refresh_id).digest("base64");
  if (hash === refresh_token) {
    req.body = req.jwt;
    delete(req.body.exp);
    delete(req.body.iat);
    return next();
  } else {
    return res.status(400).send({error: 'Invalid refresh token'});
  }
};


exports.validJWTNeeded = async (req, res, next) => {
  if (req.headers['authorization']) {
    try {
      let authorization = req.headers['authorization'].split(' ');
      if (authorization[0] !== 'Bearer') {
        logError("[!][401][validJWTNeeded] Invalid authorization header:", req.headers);
        return res.status(401).send();
      } else {
        req.jwt = jwt.verify(authorization[1], jwt_secret);

        let session_valid = await sessionModel.validSession({
          sessionId: req.jwt.sessionId,
          userId: req.jwt.userId,
          refreshKey: req.jwt.refreshKey
        });
        if (session_valid){
          sessionModel.updateSession(
            {sessionId: req.jwt.sessionId, sourceIP: req.ip}
          ).then(() => next()
          ).catch(error => {
            logError("[!][500][validJWTNeeded] Failed to update session.");
            return res.status(500).send({errors: error});
          });
        } else {
          logError("[!][403][validJWTNeeded] Invalid session:", req.jwt.sessionId);
          return res.status(403).send();
        }
      }
    } catch (err) {
      logError("[!][403][validJWTNeeded] Unknown validJWTNeeded error:", err);
      return res.status(403).send();
    }
  } else {
    logError("[!][401][validJWTNeeded] Authorization headers not found.");
    return res.status(401).send();
  }
};


exports.validateCleanBodyFields = (allowedFields) => (req, res, next) => {
  for (let key in req.body) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)){
      if (! allowedFields.includes(key)) {
        logError(
          "[!][401][validateCleanBodyFields] Invalid body field:",
          key,
          req.body,
        );
        return res.status(400).send({error: 'Invalid request body'});
      }
    }
  }
  return next();
};

exports.validateMandatoryBodyFields = (requiredFields) => (req, res, next) => {
  requiredFields.forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(req.body, key)){
      logError(
        "[!][401][validateMandatoryBodyFields] Missing body parameter:",
        key,
        req.body,
      );
      return res.status(400).send({error: 'Missing body parameter: ' + key});
    }
  });
  return next();
};
