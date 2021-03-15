const userModel = require('../users/model.js');
const authModel = require('../auth/model.js');

const { permissionLevels } = require('../constants.js');

const crypto = require('crypto');

const hashPassword = (password) => {
  let salt = crypto.randomBytes(16).toString('base64');
  let hash = crypto.createHmac('sha512', salt).update(password).digest("base64");
  return salt + "$" + hash;
}

exports.updatePassword = (userId, password) => 
  userModel.patchUser(userId, {password: hashPassword(password)})
  .then(authModel.disableUserSessions(userId));

exports.createUser = (userData) => {
  if( !(userData.email && userData.password)) {
    throw new Error("Missing email or password");
  }

  userData.password = hashPassword(userData.password);
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
