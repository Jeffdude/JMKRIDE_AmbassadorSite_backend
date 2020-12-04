const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const jwt_secret = require('../environment.js').JWTSecret;
const sessionModel = require('../auth/model.js');

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
            return res.status(500).send({errors: error});
          });
        } else {
          return res.status(403).send();
        }
      }
    } catch (err) {
      console.log("error:", err);
      return res.status(403).send();
    }
  } else {
    return res.status(401).send();
  }
};


exports.validateCleanBodyFields = (allowedFields) => (req, res, next) => {
  for (let key in req.body) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)){
      if (! allowedFields.includes(key)) {
        return res.status(400).send({error: 'Invalid request body'});
      }
    }
  }
  return next();
};
