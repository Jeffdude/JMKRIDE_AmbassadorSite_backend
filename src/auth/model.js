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
  enabled: Boolean,
});
const sessionModel = mongoose.model('session', sessionSchema);


/* ------------------  Model Functions ------------------  */

exports.getId = () => {
  return new ObjectId;
};

exports.createSession = ({ userId, sourceIP, sessionId }, thenFn) => {
  const newSession = new sessionModel({
    owner: userId,
    _id: sessionId,
    lastUsedDate: Date.now(),
    lastUsedIP: sourceIP,
    enabled: true,
  });
  return newSession.save();
}

exports.updateSession = ({sessionId, sourceIP}) => {
  return sessionModel.findOneAndUpdate({ _id: sessionId }, {
    lastUsedDate: Date.now(),
    lastUsedIP: sourceIP,
  });
}

exports.getByOwner = (userId) => {
  return sessionModel.find({owner: userId})
}

exports.getById = (sessionId) => {
  return sessionModel.findById(sessionId);
}

exports.validSession = async (sessionId, userId) => {
  let session = await sessionModel.findById(sessionId).exec();
  if (session && session.owner._id === userId) {
    return session.enabled;
  }
  return false;
}

exports.disableUserSessions = (userId) => {
  function disable_session(session) {
    session.enabled = false;
    session.save();
  }
  UserModel.findByID(userID).then(userResult => {
    sessionModel.find({owner: userResult}).then(allSessions => {
      allSessions.map(disable_session);
    });
  });
}

