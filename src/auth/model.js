const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;

const UserModel = require('../users/model.js');


/* ------------------  Model Definition ------------------  */

const sessionSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'Users' },
  lastUsedDate: Date,
  lastUsedIP: String,
  enabled: Boolean,
});
const sessionModel = mongoose.model('session', sessionSchema);


/* ------------------  Model Functions ------------------  */

exports.createSession = ({ userId, sourceIP }) => {
  UserModel.findById(userId).then((user) => {
    debugger;
    const newSession = new sessionModel({
      owner: user,
      lastUsedDate: Date.now(),
      lastUsedIP: sourceIP,
      enabled: true,
    });
    return newSession.save();
  });
}

exports.updateSession = ({sessionID, sourceIP}) => {
  sessionModel.findByID(sessionID).then((resultSession) => {
    resultSession.lastUsedDate = Date.now();
    resultSession.lastUsedIP = sourceIP;
    return resultSession.save();
  })
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

