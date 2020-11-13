const permissionValues = require('../config.js').permissionValues;

exports.permissionLevelPasses = (minimum_level, permission_level) => {
  return(permissionValues[minimum_level] <= permissionValues[permission_level]);
};
