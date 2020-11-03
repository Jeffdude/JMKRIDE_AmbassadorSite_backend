const crypto = require('crypto');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const sessionModel = require('./model.js');
const config = require('../config.js');
const asyncRoute = require('../modules/async.js').asyncRoute;

const jwt_secret = config.jwt_secret;
const jwt_options = config.jwt_options;

const {
  sendAndPrintErrorFn,
  sendAndPrintError
} = require('../modules/errors.js');

exports.login = (req, res) => {
  try {
    let salt = crypto.randomBytes(16).toString('base64');
    req.body.refreshKey = salt;

    req.body.sessionId = sessionModel.getId();
    

    sessionModel.createSession({
      userId: req.body.userId,
      sessionId: req.body.sessionId,
      sourceIP: req.ip,
    });

    console.log("req.body:", req.body);

    let token = jwt.sign(req.body, jwt_secret, jwt_options);

    let refreshId = req.body.userId + jwt_secret;
    let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
    let refresh_token = Buffer.from(hash).toString('base64');

    res.status(201).send({
      accessToken: token,
      refreshToken: refresh_token,
      expiresIn: config.jwt_options.expiresIn
    });

  } catch (err) {
    sendAndPrintError(err, res);
  }
};

exports.refresh_token = (req, res) => {
  try {
    req.body = req.jwt;
    let token = jwt.sign(req.body, jwt_secret, jwt_options);
    res.status(201).send({id: token});
  } catch (err) {
    sendAndPrintError(err, res);
  }
};

exports.get_sessions = (req, res) => {
  try {
    sessionModel.getByOwner(req.jwt.userId, true).then(  // enabled sessions
      (sessions) => res.status(201).send(sessions)
    ).catch(sendAndPrintErrorFn(res));
  } catch (err) {
    sendAndPrintError(err, res);
  }
};

exports.disable_all_sessions = (req, res) => {}

exports.disable_session = (req, res) => {
  try {
    sessionModel.getByOwner(req.jwt.userId, true).then(  // enabled sessions
      (sessions) => res.status(201).send(sessions)
    ).catch(sendAndPrintErrorFn(res));
  } catch (err) {
    sendAndPrintError(err, res);
  }
}
