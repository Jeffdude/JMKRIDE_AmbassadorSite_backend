const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const authLib = require('./lib.js');
const sessionModel = require('./model.js');
const config = require('../config.js');
const jwt_options = config.jwt_options;

const jwt_secret = require('../environment.js').JWTSecret;

const {
  sendAndPrintErrorFn,
  sendAndPrintError
} = require('../modules/errors.js');

const { controller_run } = require('../modules/templates.js');

exports.login = async (req, res) => {
  try {
    let salt = crypto.randomBytes(16).toString('base64');
    req.body.refreshKey = salt;

    if (req.body.sessionId) {
      await sessionModel.refreshSession({
        sessionId: req.body.sessionId,
        refreshKey: salt,
      }).exec();
    } else {
      req.body.sessionId = sessionModel.getId();
      

      await sessionModel.createSession({
        userId: req.body.userId,
        sessionId: req.body.sessionId,
        sourceIP: req.ip,
        refreshKey: salt,
      });
    }

    let token = jwt.sign(req.body, jwt_secret, jwt_options);

    let refreshId = req.body.userId + jwt_secret;
    let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
    let refresh_token = Buffer.from(hash).toString('base64');

    res.status(201).send({
      accessToken: token,
      refreshToken: refresh_token,
      expiresIn: config.jwt_options.expiresIn
    });

  } catch (err) {
    sendAndPrintError(res, err);
  }
};

exports.refresh_token = (req, res) => {
  try {
    req.body = req.jwt;
    let token = jwt.sign(req.body, jwt_secret, jwt_options);
    res.status(201).send({id: token});
  } catch (err) {
    sendAndPrintError(res, err);
  }
};

exports.get_user_sessions = (req, res) => {
  try {
    sessionModel.getByOwner(req.jwt.userId, true).lean().then(  // enabled sessions
      (sessions) => {
        let to_return = sessions.map((session) => {
          if (session._id == req.jwt.sessionId) {
            session.current = true;
          }
          session.id = session._id;
          delete(session._id);
          return session;
        });
        res.status(200).send(to_return);
      }
    ).catch(sendAndPrintErrorFn(res));
  } catch (err) {
    sendAndPrintError(err, res);
  }
};

exports.get_session = (req, res) => {
  controller_run(req, res)(
    () => sessionModel.getById(req.params.sessionId),
    (result) => res.status(200).send(result),
  )
}

exports.disable_all_sessions = (req, res) => {
  controller_run(req, res)(
    () => sessionModel.disableUserSessions(req.jwt.userId), // enabled sessions
    () => res.status(200).send(),
  );
}

const disable_session_id = (req, res, sessionId) => {
  controller_run(req, res)(
    () => sessionModel.disableSession(sessionId), // enabled sessions
    (session) => {
      if(session){
        return res.status(200).send()
      }
      throw new Error("[disable_session_id] failed to disable:", sessionId);
    },
  );
}

exports.disable_session = (req, res) => {
  disable_session_id(req, res, req.params.sessionId);
}

exports.disable_current_session = (req, res) => {
  disable_session_id(req, res, req.jwt.sessionId);
}

exports.createAndSendEmailVerificationToken = (req, res) =>
  controller_run(req, res)(
    () => authLib.createAndSendEmailVerificationToken({
      userId: req.jwt.userId,
    }),
    () => res.status(201).send(),
  )

exports.verifyEmailVerificationToken = (req, res) =>
  controller_run(req, res)(
    () => authLib.verifyEmailToken(req.body.key, req.jwt.userId),
    () => res.status(200).send({result: "success"}),
  );

exports.resetPasswordWithPassword = (req, res) =>
  controller_run(req, res)(
    () => authLib.resetPasswordWithPassword({
      userId: req.body.userId,
      oldPassword: req.body.oldPassword,
      newPassword: req.body.newPassword,
    }),
    () => res.status(202).send({result: "success"}),
  );
