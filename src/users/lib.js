const userModel = require('../users/model.js');
const authModel = require('../auth/model.js');

const { permissionLevels } = require('../constants.js');

const crypto = require('crypto');


exports.createUser = (userData) => {
  if( !(userData.email && userData.password)) {
    throw new Error("Missing email or password");
  }

  let salt = crypto.randomBytes(16).toString('base64');
  let hash = crypto.createHmac('sha512', salt).update(userData.password).digest("base64");

  userData.password = salt + "$" + hash;
  userData.permissionLevel = permissionLevels.USER;
  userData.balance = 0;

  return userModel.createUser(userData);
};

exports.approveAmbassador = (userId) => {
  return userModel.patchUser(userId, {
    permissionLevel: permissionLevels.AMBASSADOR
  }).then(() =>
    authModel.disableUserSessions(userId)
  );
}
