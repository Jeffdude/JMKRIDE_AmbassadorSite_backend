const permissionHelpers = require('../modules/permissions.js');

const { permissionLevels } = require('../config.js')
const { sendAndPrintErrorFn, sendAndPrintError } = require('../modules/errors.js');

const challengeConstants = require('../challenges/constants.js');
const challengeModel = require('../challenges/model.js');


exports.minimumPermissionLevelRequired = (required_permission_level) => {
  return (req, res, next) => {
    let user_permission_level = req.jwt.permissionLevel;
    if(permissionHelpers.permissionLevelPasses(
      required_permission_level,
      user_permission_level,
    )) {
      return next();
    } else {
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
  if(permissionHelpers.permissionLevelPasses(
    permissionLevels.AMBASSADOR,
    user_permission_level,
  )) {
    return next();
  } else if (
    permissionHelpers.permissionLevelPasses(
      permissionLevels.USER,
      user_permission_level,
    )
  ) {
    isAmbassadorApplication(req, res)
      .then(result => {
        if(result){
          return next()
        }
        return res.status(403).send();
      })
      .catch(sendAndPrintErrorFn(res))
  } else { 
    return res.status(403).send();
  }
};

exports.onlySameUserOrAdminCanDoThisAction = (req, res, next) => {
  const getTarget = async (req) => {
    if ( req.params && req.params.userId) {
      return req.params.userId;
    } else if (req.params.submissionId) {
      let submission = await challengeModel.getSubmissions(
        {submissionId: req.params.submissionId, populateAuthor: false}
      )
      return submission.author.toString();
    }
  }
  getTarget(req).then(
    (target) => {
      if (target === req.jwt.userId) {
        return next();
      } else if (req.jwt.permissionLevel === permissionLevels.ADMIN) {
        return next();
      } else {
        return res.status(403).send();
      }
    }
  )
};

exports.sameUserCantDoThisAction = (req, res, next) => {
  let userId = req.jwt.userId;

  if (req.params.userId !== userId) {
    return next();
  } else {
    return res.status(400).send();
  }

};
