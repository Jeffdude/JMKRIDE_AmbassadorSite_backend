const { permissionLevels } = require('../constants.js')
const {
  sendAndPrintErrorFn,
  sendAndPrintError,
  logError,
} = require('../modules/errors.js');

const challengeConstants = require('../challenges/constants.js');
const challengeModel = require('../challenges/model.js');


exports.minimumPermissionLevelRequired = (required_permission_level) => {
  return (req, res, next) => {
    let user_permission_level = req.jwt.permissionLevel;
    if(required_permission_level <= user_permission_level) {
      return next();
    } else {
      logError(
        "[!][403][minimumPermissionLevelRequired][" + req.originalUrl + "] Permission Level Failed: " +
        user_permission_level + " < " + required_permission_level + "."
      );
      return res.status(403).send();
    }
  };
};

/*
 * Will call next() if the user is an ambassador...
 *  OR the user is a USER and the query is for the ambassador application
 * Otherwise, 403
 */
exports.mustBeAmbassadorUnlessThisIsAmbassadorApplication = (req, res, next) => {
  const isAmbassadorApplication = async (req, res) => {

    let challengeId = req.params.challengeId 
      ? req.params.challengeId 
      : req.query.challengeId;

    let submissionId = req.params.submissionId 
      ? req.params.submissionId 
      : req.query.submissionId;

    let submission, ambassadorApplication;

    if (submissionId) {
      try {
        submission = await challengeModel.getSubmissions({submissionId: submissionId});
      } catch(error) {
        sendAndPrintError(res, error);
      }
      if(submission) {
        challengeId = submission.challenge._id.toString();
      } else {
        return false
      }
    }

    if (challengeId) {
      try {
        ambassadorApplication = await challengeConstants.getAmbassadorApplication()
      } catch (error) {
        sendAndPrintError(res, error);
      }
      return challengeId === ambassadorApplication.id.toString();
    }
    return false
  };

  let user_permission_level = req.jwt.permissionLevel;
  if(permissionLevels.AMBASSADOR <= user_permission_level) {
    return next();
  } else if (permissionLevels.USER <= user_permission_level) {
    isAmbassadorApplication(req, res)
      .then(result => {
        if(result){
          return next()
        }
        logError(
          "[!][403][mustBeAmbassadorUnlessThisIsAmbassadorApplication][" + req.originalUrl + "] " +
          "Failed auth of user:",
          user_permission_level, 
          req.params,
          req.query,
        );
        return res.status(403).send();
      })
      .catch(sendAndPrintErrorFn(res))
  } else { 
    logError(
      "[!][403][mustBeAmbassadorUnlessThisIsAmbassadorApplication][" + req.originalUrl + "] " +
      "Failed auth of none:",
      user_permission_level, 
      req.params,
      req.query,
    );
    return res.status(403).send();
  }
};

exports.onlySameUserOrAdminCanDoThisAction = getTarget => (req, res, next) => {
  const target = getTarget(req);
  if (Array.isArray(target))
    if(target.map(t => t.toString()).includes(req.jwt.userId.toString()))
      return next();
  if (target.toString() === req.jwt.userId.toString()) {
    return next();
  } else if (req.jwt.permissionLevel == permissionLevels.ADMIN) {
    return next();
  } else {
    logError(
      "[!][403][onlySameUserOrAdminCanDoThisAction][" + req.originalUrl + "] Failed: ",
      {target, requestUser: req.jwt.userId}
    );
    return res.status(403).send();
  }
};

exports.sameUserCantDoThisAction = (req, res, next) => {
  let userId = req.jwt.userId;

  if (req.params.userId !== userId) {
    return next();
  } else {
    logError(
      "[!][403][sameUserCantDoThisAction][" + req.originalUrl + "] Failed: " +
      req.params,
      userId,
    );
    return res.status(400).send();
  }

};
