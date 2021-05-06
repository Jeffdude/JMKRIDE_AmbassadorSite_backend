const { permissionLevels } = require('../constants.js');
const { logInfo, logError } = require('../modules/errors.js');

const constantsModel = require('./model.js');
const constantsInitializer = require('./initializer.js');

const userModel = require('../users/model.js');

const challengeModel = require('../challenges/model.js');


/*
 * Setup all constants for Ambassador Server
 *
 * Returns: resultMap (thenable)
 */
exports.initSiteState = () => {
  let buildfns = []; // functions to check constants and compile create funcs if needed
  let fns = [];      // all create funcs
  let initializer = new constantsInitializer();

  Object.keys(initializer.initializers).map(key => {
    buildfns.push(
      constantsModel.getByName(key)
        .then(res => {
          if(! res) {
            logInfo(
              '[+]', key, 'not found. Creating...'
            )
            fns.push(initializer.initializers[key]());
          } else {
            logInfo('[+]', key, 'already exists.');
          }
        })
        .catch(logError)
    )
  });

  const flattenResults = (resultMap) => new Promise((resolve) => {
    let flatResults = {};
    resultMap.forEach(result => flatResults[result[0]] = result[1]);
    resolve(flatResults);
  })

  const setAdminPermissions = (resultMap) => new Promise((resolve, reject) => {
    if(
      Object.hasOwnProperty.call(resultMap, 'ambassadorApplication')
      && Object.hasOwnProperty.call(resultMap, 'adminUser')
    ){
      userModel.patchUser(
        resultMap['adminUser']._id, 
        {permissionLevel: permissionLevels.ADMIN},
      )
        .then(resolve)
        .catch(reject)
    } else {
      resolve()
    }
  })

  const setAmbassadorApplicationOwner = (resultMap) => new Promise((resolve, reject) => {
    if(
      Object.hasOwnProperty.call(resultMap, 'ambassadorApplication')
      && Object.hasOwnProperty.call(resultMap, 'adminUser')
    ){
      challengeModel.updateChallengeById(
        resultMap['ambassadorApplication']._id, 
        {creator: resultMap['adminUser']._id},
      )
        .then(resolve)
        .catch(reject)
    } else {
      resolve()
    }
  })

  return Promise.all(buildfns)
    .then(() => {
      let resultMap = Promise.all(fns)
        .then(flattenResults)
      Promise.all([
        setAmbassadorApplicationOwner,
        setAdminPermissions,
      ].map(fn => resultMap.then(fn))
      ).then(() => {
        logInfo('[+] Server constants nominal.')
      })
      .catch(logError);
    })
    .catch(logError);
};
