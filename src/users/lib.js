const crypto = require('crypto');

const userModel = require('../users/model.js');
const authModel = require('../auth/model.js');

const { permissionLevels } = require('../constants.js');
const { processMode } = require('../environment.js');


class UserLib {
  static hashPassword(password) {
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(password).digest("base64");
    return salt + "$" + hash;
  }

  static updatePassword(userId, password) {
    return userModel.patchUser(userId, {password: this.hashPassword(password)})
      .then(authModel.disableUserSessions(userId));
  }

  static createUser(userData) {
    if( !(userData.email && userData.password)) {
      throw new Error("Missing email or password");
    }

    userData.password = this.hashPassword(userData.password);
    userData.permissionLevel = permissionLevels.USER;

    return userModel.createUser(userData);
  }
}

class AmbassadorsiteUserLib extends UserLib {
  static createUser(userData) {
    if( !(userData.email && userData.password)) {
      throw new Error("Missing email or password");
    }

    userData.password = this.hashPassword(userData.password);
    userData.permissionLevel = permissionLevels.USER;
    userData.balance = 0;

    return userModel.createUser(userData);
  }

  static approveAmbassador(userId){
    return userModel.patchUser(userId, {
      permissionLevel: permissionLevels.AMBASSADOR
    }).then(() =>
      authModel.disableUserSessions(userId)
    );
  }
}

class StocktrackerUserLib extends UserLib {}

module.exports = {
  ambassadorsite: AmbassadorsiteUserLib,
  stocktracker: StocktrackerUserLib,
}[processMode];
