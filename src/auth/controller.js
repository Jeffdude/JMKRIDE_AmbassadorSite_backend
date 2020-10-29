const crypto = require('crypto');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const sessionModel = require('./model.js');
const config = require('../config.js');

const jwt_secret = config.jwt_secret;
const jwt_options = config.jwt_options;

exports.login = (req, res) => {
  try {
    let salt = crypto.randomBytes(16).toString('base64');
    req.body.refreshKey = salt;

    sessionModel.createSession({
      userId: req.body.userId.toHexString(),
      sourceIP: req.ip,
    }).then(result => {
      console.log("result:", result);
      req.body.sessionId = result._id.toHexString();
    }).catch(error => {console.log("error:", error)});

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
    res.status(500).send({errors: err});
  }
};

exports.refresh_token = (req, res) => {
  try {
    req.body = req.jwt;
    let token = jwt.sign(req.body, jwt_secret, jwt_options);
    res.status(201).send({id: token});
  } catch (err) {
    res.status(500).send({errors: err});
  }
};
