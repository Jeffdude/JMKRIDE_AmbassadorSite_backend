const constantModel = require('./model.js');
const permissionLevels = require('../config.js').permissionLevels;
const processMode = require('../environment.js').processMode;

const userConstants = require('../users/constants.js');
const userModel = require('../users/model.js');
const userLib = require('../users/lib.js');

const partModel = require('../inventory/model.js');
const partConstants = require('../inventory/constants.js');

const challengeConstants = require('../challenges/constants.js');
const challengeModel = require('../challenges/model.js');

exports.getAmbassadorApplication = () => {
  return constantModel.getByName('ambassadorApplication');
};

const createConstantPromise = (
  constantName, creationFn, data, debug = true,
) => {
  return new Promise((resolve, reject) => {
    creationFn(data)
      .then((res) => {
        if(! res) {
          reject(new Error('Failed to create constant:', data, res));
        }
        if(res._id) {
          constantModel.createConstant({
            name: constantName,
            id: res._id,
          }).then(() => {
            if(debug) {
              console.log('[+] Created constant:', constantName);
            }
            resolve([constantName, res]);
          })
          .catch(err => {
            console.error('[!] Error resolving createFn err');
            reject(err);
          });
        } else {
          reject(new Error('Failed to create constant:', data, res.error));
        }
      })
      .catch(err => {
        console.log('[!] Error creating', constantName, ':', err.message);
        reject(err);
      });
  });
};

let allPartConstants = {}
partConstants.allParts.forEach(part => allPartConstants[part.name] = (debug) => 
  createConstantPromise(
    part.name,
    (partData) => partModel.createPart(partData),
    part,
    debug,
  )
);


const processModeInitializers = {
  "stocktracker": allPartConstants,
  "ambassadorsite": {
    'adminUser': (debug) => 
      createConstantPromise(
        'adminUser',
        (userData) => userLib.createUser(userData),
        userConstants.adminUserData,
        debug,
      ),
    'ambassadorApplication': (debug) => 
      createConstantPromise(
        'ambassadorApplication',
        challengeModel.createChallenge,
        challengeConstants.ambassadorApplicationData,
        debug,
      ),
  },
}

/*
 * Setup all constants for Ambassador Server
 *
 * Returns: Thenable
 */
exports.initSiteState = (debug = true) => {
  let buildfns = []; // functions to check constants and compile create funcs if needed
  let fns = [];      // all create funcs
  let initializers = processModeInitializers[processMode];

  Object.keys(initializers).map(key => {
    buildfns.push(
      constantModel.getByName(key)
        .then(res => {
          if(! res) {
            if(debug) {
              console.log('[+]', key, 'not found. Creating...');
            }
            fns.push(initializers[key](debug));
          } else if(debug) {
            console.log('[+]', key, 'already exists.');
          }
        })
        .catch(console.error)
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
        if(debug) {
          console.log('[+] Server constants nominal.');
        }
      })
      .catch(console.error);
    })
    .catch(console.error);
};
