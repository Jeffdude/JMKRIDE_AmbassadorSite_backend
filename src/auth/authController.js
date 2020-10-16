const crypto = require('crypto');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const config = require('../config.js');


const jwt_secret = config.jwt_secret;

exports.login = (req, res) => {
  console.log(jwt_secret);
  try {
    let refreshId = req.body.userId + jwt_secret;
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
    req.body.refreshKey = salt;
    let token = jwt.sign(req.body, jwt_secret);
    let b = Buffer.from(hash);
    let refresh_token = b.toString('base64');
    res.status(201).send({accessToken: token, refreshToken: refresh_token});
  } catch (err) {
    res.status(500).send({errors: err});
  }
};

exports.refresh_token = (req, res) => {
  try {
    req.body = req.jwt;
    let token = jwt.sign(req.body, jwtSecret);
    res.status(201).send({id: token});
  } catch (err) {
    res.status(500).send({errors: err});
  }
};
