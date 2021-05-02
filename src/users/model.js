const User = require('./schema.js');
const { processMode } = require('../environment.js');


/* ------------------------- Generics ------------------------------- */

class BaseUserModel {

  static findByEmail(email) {
    return User.find({email: email});
  }

  static findById(id) {
    return User.findById(id);
  }

  static createUser(userData) {
    const user = new User(userData);
    return user.save();
  }

  static list(perPage, page) {
    return new Promise((resolve, reject) => {
      User.find()
        .limit(perPage)
        .skip(perPage * page)
        .exec(function (err, users) {
          if (err) {
            reject(err);
          } else {
            resolve(users);
          }
        })
    });
  }

  static patchUser(id, userData) {
    return User.findOneAndUpdate({
      _id: id
    }, userData);
  }

  static removeById(userId) {
    return new Promise((resolve, reject) => {
      User.deleteMany({_id: userId}, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(err);
        }
      });
    });
  }
}


/* ------------------------ AmbassadorSite -------------------------- */

class AmbassadorsiteUserModel extends BaseUserModel {
  static findById(
    id, 
    {
      populateSubmissionCount = false,
      populateReferralCode = false
    } = {}) {
      let user = User.findById(id);
      if(populateSubmissionCount) {
        user.populate('submissionCount');
      }
      if(populateReferralCode) {
        user.populate('referralCode');
      }
      return user;
  }

  static list(perPage, page) {
    return new Promise((resolve, reject) => {
      User.find()
        .populate('submissionCount')
        .limit(perPage)
        .skip(perPage * page)
        .exec(function (err, users) {
          if (err) {
            reject(err);
          } else {
            resolve(users);
          }
        })
    });
  }
}


/* ------------------------ StockTracker -------------------------- */

class StocktrackerUserModel extends BaseUserModel {}


/* ------------------------ Exports -------------------------- */

module.exports = {
  ambassadorsite: AmbassadorsiteUserModel,
  stocktracker: StocktrackerUserModel,
}[processMode];
