const { permissionLevels } = require('../constants.js')
const {
  sendAndPrintErrorFn,
  sendAndPrintError,
  logError,
} = require('../modules/errors.js');

const challengeConstants = require('../challenges/constants.js');
const challengeModel = require('../challenges/model.js');
const transactionModel = require('../transactions/model.js');


exports.minimumPermissionLevelRequired = (required_permission_level) => {
  return (req, res, next) => {
    let user_permission_level = req.jwt.permissionLevel;
    if(required_permission_level <= user_permission_level) {
      return next();
    } else {
      logError(
        "[!][403][minimumPermissionLevelRequired] Permission Level Failed: " +
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
          "[!][403][mustBeAmbassadorUnlessThisIsAmbassadorApplication] " +
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
      "[!][403][mustBeAmbassadorUnlessThisIsAmbassadorApplication] " +
      "Failed auth of none:",
      user_permission_level, 
      req.params,
      req.query,
    );
    return res.status(403).send();
  }
};

exports.onlySameUserOrAdminCanDoThisAction = (req, res, next) => {
  const getTarget = async (req) => {
    if ( req.params && req.params.userId) {
      return req.params.userId;
    } else if (req.query.userId) {
      return req.query.userId;
    } else if (req.body.userId) {
      return req.body.userId;
    } else if (req.params.submissionId || req.query.submissionId) {
      let submissionId = req.params.submissionId 
        ? req.params.submissionId 
        : req.query.submissionId;
      let submission = await challengeModel.getSubmissions(
        {submissionId: submissionId, populateAuthor: false}
      )
      return submission.author.toString();
    } else if (req.query.id || req.query.referralCodeId) {
      let referralCodeId = req.query.referralCodeId 
        ? req.query.referralCodeId 
        : req.query.id;
      let referralCode = await transactionModel.getReferralCode(
        {id: referralCodeId, populate: false}
      )
      return referralCode[0].owner.toString();
    }
  }
  getTarget(req).then(
    (target) => {
      if (target === req.jwt.userId) {
        return next();
      } else if (req.jwt.permissionLevel == permissionLevels.ADMIN) {
        return next();
      } else {
        logError(
          "[!][403][onlySameUserOrAdminCanDoThisAction] Failed: " +
          target,
          req.params,
          req.query,
        );
        return res.status(403).send();
      }
    }
  )
  .catch(sendAndPrintErrorFn(res))
};

exports.sameUserCantDoThisAction = (req, res, next) => {
  let userId = req.jwt.userId;

  if (req.params.userId !== userId) {
    return next();
  } else {
    logError(
      "[!][403][sameUserCantDoThisAction] Failed: " +
      req.params,
      userId,
    );
    return res.status(400).send();
  }

};
