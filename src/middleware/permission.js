const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const secret = require('../config.js').jwt_secret;
const permissionHelpers = require('../modules/permissions.js');

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

exports.onlySameUserOrAdminCanDoThisAction = (req, res, next) => {
  let user_permission_level = req.jwt.permissionLevel;
  let userId = req.jwt.userId;
  if (req.params && req.params.userId && userId === req.params.userId) {
    return next();
  } else {
    if (user_permission_level === config.permissionLevels.ADMIN) {
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
