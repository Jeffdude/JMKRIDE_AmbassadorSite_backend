const permissionHelpers = require('../modules/permissions.js');

const { permissionLevels } = require('../config.js')
const { sendAndPrintErrorFn, sendAndPrintError } = require('../modules/errors.js');
const challengeConstants = require('../challenges/constants.js');

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

exports.mustBeAmbassadorUnlessThisIsAmbassadorApplication = (req, res, next) => {
  let user_permission_level = req.jwt.permissionLevel;
  if(permissionHelpers.permissionLevelPasses(
    permissionLevels.AMBASSADOR,
    user_permission_level,
  )) {
    return next();
  } else if (req.params.challengeId !== undefined) {
    try {
      challengeConstants.getAmbassadorApplication()
        .then(result => {
          if(req.params.challengeId == result.id) {
            return next();
          } else {
            return res.status(403).send();
          }
        })
        .catch(sendAndPrintErrorFn(res))
    } catch(error) {
      sendAndPrintError(res, error)
    }
  }
};

exports.onlySameUserOrAdminCanDoThisAction = (req, res, next) => {
  let user_permission_level = req.jwt.permissionLevel;
  let userId = req.jwt.userId;
  if (req.params && req.params.userId && userId === req.params.userId) {
    return next();
  } else {
    if (user_permission_level === permissionLevels.ADMIN) {
      return next();
    } else {
      return res.status(403).send();
    }
  }

};

exports.sameUserCantDoThisAction = (req, res, next) => {
  let userId = req.jwt.userId;

  if (req.params.userId !== userId) {
    return next();
  } else {
    return res.status(400).send();
  }

};
