const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;

const UserModel = require('../users/model.js');

const ObjectId = mongoose.Types.ObjectId;


/* ------------------  Model Definition ------------------  */

const sessionSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'user' },
  sessionId: String,
  lastUsedDate: Date,
  lastUsedIP: String,
  // only one set of access_token/refresh_tokens is valid per session
  refreshKey: String, 
  enabled: Boolean,
});
const sessionModel = mongoose.model('session', sessionSchema);


/* ------------------  Model Functions ------------------  */

exports.getId = () => {
  return new ObjectId;
};

exports.createSession = ({ userId, sourceIP, sessionId, refreshKey }) => {
  const newSession = new sessionModel({
    owner: userId,
    _id: sessionId,
    refreshKey: refreshKey,  
    lastUsedDate: Date.now(),
    lastUsedIP: sourceIP,
    enabled: true,
  });
  return newSession.save();
}

// called everytime session is seen and authenticated with API
exports.updateSession = ({sessionId, sourceIP}) => {
  return sessionModel.findOneAndUpdate({ _id: sessionId }, {
    lastUsedDate: Date.now(),
    lastUsedIP: sourceIP,
  });
}

// called when jwt is refreshed
exports.refreshSession = ({sessionId, refreshKey}) => {
  return sessionModel.findOneAndUpdate({ _id: sessionId }, {
    refreshKey: refreshKey,
  });
}

exports.disableSession = (sessionId) => {
  return sessionModel.findOneAndUpdate({_id: sessionId}, {enabled: false})
}

exports.getByOwner = (userId, enabled) => {
  return sessionModel.find(
    {owner: userId, enabled: enabled}
  ).select('lastUsedDate lastUsedIP');
}

exports.getById = (sessionId) => {
  return sessionModel.findById(sessionId);
}

exports.validSession = async ({sessionId, userId, refreshKey}) => {
  let session = await sessionModel.findById(sessionId).exec();
  return (
    session 
    && session.owner._id == userId
    && session.refreshKey == refreshKey
    && session.enabled
  )
}

exports.disableUserSessions = (userId) => {
  function disable_session(session) {
    session.enabled = false;
    session.save();
  }
  UserModel.findByID(userId).then(userResult => {
    sessionModel.find({owner: userResult}).then(allSessions => {
      allSessions.map(disable_session);
    });
  });
}

