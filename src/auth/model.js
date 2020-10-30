const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;

const UserModel = require('../users/model.js');


/* ------------------  Model Definition ------------------  */

const sessionSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'Users' },
  sessionId: String,
  lastUsedDate: Date,
  lastUsedIP: String,
  enabled: Boolean,
});
const sessionModel = mongoose.model('session', sessionSchema);


/* ------------------  Model Functions ------------------  */

exports.getId = () => {
  return mongoose.Types.ObjectID();
};

exports.createSession = ({ userId, sourceIP, sessionId }, thenFn) => {
  UserModel.findById(userId).then((user) => {
    const newSession = new sessionModel({
      owner: user,
      _id: sessionId,
      lastUsedDate: Date.now(),
      lastUsedIP: sourceIP,
      enabled: true,
    });
    return newSession.save();
  }).catch(error => { 
    console.log("User ID (", userId, ") not found:", error);
    return;
  });
}


exports.updateSession = ({sessionId, sourceIP}) => {
  sessionModel.findOneAndUpdate({ _id: sessionId }, {
    lastUsedDate: Date.now(),
    lastUsedIP: sourceIP,
  });
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

