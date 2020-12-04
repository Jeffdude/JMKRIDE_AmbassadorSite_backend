const crypto = require('crypto');

const PERMISSION_LEVELS = require('../config.js').permissionLevels;
const userModel = require('../users/model.js');

exports.createUser = (userData) => {
  if( !(userData.email && userData.password)) {
    throw new Error("Missing email or password");
  }

  let salt = crypto.randomBytes(16).toString('base64');
  let hash = crypto.createHmac('sha512', salt).update(userData.password).digest("base64");

  userData.password = salt + "$" + hash;
  userData.permissionLevel = PERMISSION_LEVELS.USER;

  return userModel.createUser(userData);
};
