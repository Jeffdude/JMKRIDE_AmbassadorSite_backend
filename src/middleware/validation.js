const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { JWTSecret : jwt_secret, authorizedLambdaIP} = require('../environment.js');
const sessionModel = require('../auth/model.js');
const { logError, logInfo } = require('../modules/errors.js');

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
        logInfo("[!][401][validJWTNeeded] Invalid authorization header:", req.headers);
        return res.status(401).send();
      } else {
        req.jwt = jwt.verify(authorization[1], jwt_secret);

        let session_valid = await sessionModel.validSession({
          sessionId: req.jwt.sessionId,
          userId: req.jwt.userId,
          refreshKey: req.jwt.refreshKey
        });
        if (session_valid){
          console.log(req.ips)
          sessionModel.updateSession(
            {sessionId: req.jwt.sessionId, sourceIP: req.ips.length ? req.ips[0] : req.ip}
          ).then(() => next()
          ).catch(error => {
            logInfo("[!][500][validJWTNeeded] Failed to update session.");
            return res.status(500).send({errors: error});
          });
        } else {
          logInfo("[!][403][validJWTNeeded] Invalid session:", req.jwt.sessionId);
          return res.status(403).send();
        }
      }
    } catch (err) {
      logInfo("[!][403][validJWTNeeded] Unknown validJWTNeeded error:", err);
      return res.status(403).send();
    }
  } else {
    logInfo("[!][401][validJWTNeeded] Authorization headers not found.");
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
  const missing_fields = requiredFields.filter(
    key => !Object.prototype.hasOwnProperty.call(req.body, key),
  );
  if(missing_fields.length) {
    logError(
      "[!][401][validateMandatoryBodyFields] Missing body parameters:",
      "'" + missing_fields.join() + "'",
      "received:",
      req.body,
    );
    return res.status(400).send({error: 'Missing body parameters: ' + missing_fields.join()});
  }
  return next();
};
