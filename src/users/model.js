const mongoose = require('../modules/mongoose.js');
const User = require('./schema.js');
const userConstants = require('./constants');
const locationModel = require('../location/model.js');
const { processMode } = require('../environment.js');
const { permissionLevels } = require('../constants.js');


/* ------------------------- Generics ------------------------------- */

class BaseUserModel {

  static find(options) {
    return User.find(options)
  }

  static findByEmail(email) {
    return User.find({email: email});
  }

  static findById(id) {
    return User.findById(id);
  }

  static getAllUsers(){
    return User.find()
  }

  static createUser(userData) {
    const user = new User(userData);
    return user.save();
  }

  static list(perPage, page) {
    return User.find()
      .limit(perPage)
      .skip(perPage * page)
  }

  static setUserSettings(userId, settingsData) {
    return User.findById(userId).then(user => {
      user.settings = Object.assign({}, user.settings, settingsData);
      user.markModified('settings');
      return user.save()
    })
  }

  static patchUser(id, userData) {
    return User.findOneAndUpdate({_id: id}, userData);
  }

  static removeById(userId) {
    return User.deleteMany({_id: userId});
  }
}

/* ------------------------ AmbassadorSite -------------------------- */

class AmbassadorsiteUserModel extends BaseUserModel {
  static createUser({userSettings, ...userData}) {
    const settings = {...userConstants.defaultAmbassadorsiteUserSettings, ...(userSettings || {})}
    const user = new User({settings, ...userData});
    return user.save();
  }

  static findById(
    id, 
    {
      populateSubmissionCount = false,
      populateReferralCode = false,
      populateLocation = false,
      populateFriends = false,
    } = {}) {
      let user = User.findById(id);
      if(populateSubmissionCount) {
        user.populate('submissionCount');
      }
      if(populateReferralCode) {
        user.populate({path: 'referralCode', populate: {path: 'usageCount'}});
      }
      if(populateLocation) {
        user.populate('location');
      }
      if(populateFriends) {
        user.populate({path: 'friends', select: 'firstName lastName permissionLevel socialLinks profileIconName bio', populate: {path: 'location'}});
      }
      return user;
  }

  static list(perPage, page) {
    return User.find()
        .populate('submissionCount')
        .populate('location')
        .populate('friends')
        .limit(perPage)
        .skip(perPage * page)
        .then(results => results.map(user => {
          user.set('password', null)
          user.set('numFriends', user.friends.length, {strict: false})
          user.set('friends', null)
          return user;
        }))
  }

  static userIsPublic(userId) {
    return User.findById(userId).then(user => (
      user.settings && user.settings.FFUserPrivacy === userConstants.FFPrivacy.public
    ))
  }

  static getAllLocations({ requesterUserId, pendingFriends, adminUserId }) {
    return User.aggregate([
      {$match: {
        location: {$exists: true},
        "settings.FFMapVisibility": {$not: {$eq: userConstants.FFVisibility.hidden}},
      }},
      {$group: {_id: '$location', users: {$addToSet: '$_id'}}},
      {$addFields: {location: '$_id'}},
      {$project: {_id: 0}}
    ]).then(result => User.populate(result, {path: 'users', select: [
      'firstName', 'lastName', 'bio', 'friends', 'socialLinks', 'settings', 'permissionLevel', 'profileIconName'
    ]})).then(result => {
      const { incoming : incomingPendingFriends, outgoing : outgoingPendingFriends} = pendingFriends;
      result.forEach(location => location.users.forEach(user => {
        const isFriend = (requesterUserId == adminUserId || user.friends.includes(requesterUserId));
        user.set('outgoingPendingFriend', outgoingPendingFriends.includes(user._id.toString()), {strict: false});
        user.set('incomingPendingFriend', incomingPendingFriends.includes(user._id.toString()), {strict: false});
        user.set('isFriend', isFriend, {strict: false});
        user.set('isPublic', 
          (!!user.settings && user.settings.FFUserPrivacy === userConstants.FFPrivacy.public),
          {strict: false},
        );
        user.set('isAmbassador', user.permissionLevel >= permissionLevels.AMBASSADOR, {strict: false})
        // do not leak sensitive things to frontend
        if(!isFriend) user.set('socialLinks', []);
        user.set('friends', undefined)
        user.set('settings', undefined)
        user.set('permissionLevel', undefined)
      }))
      return result;
    }).then(locationModel.populateLocations)
  }

  static populateFriendRequests(results) {
    return User.populate(results, {path: 'from', select: ['firstName', 'lastName', 'bio', 'socialLinks', 'profileIconName'], populate: {path: 'location'}})
  }

  static async addFriends([ user1, user2 ]){
    console.log({user1, user2})
    return User.findOneAndUpdate(
      {_id: user1},
      {$addToSet: {friends: user2}}
    ).then(result1 =>
      User.findOneAndUpdate(
        {_id: user2},
        {$addToSet: {friends: user1}}
      ).then(result2 => {console.log({result1, result2}); return [result1, result2]})
    )
  }
}


/* ------------------------ StockTracker -------------------------- */

class StocktrackerUserModel extends BaseUserModel {
  static handleDeletedDefault({propName, id, replacement}) {
    return User.updateMany(
      {[propName]: mongoose.Types.ObjectId(id)},
      {$set: {[propName]: mongoose.Types.ObjectId(replacement)}},
    );
  }
}


/* ------------------------ Exports -------------------------- */

module.exports = {
  ambassadorsite: AmbassadorsiteUserModel,
  stocktracker: StocktrackerUserModel,
}[processMode];
