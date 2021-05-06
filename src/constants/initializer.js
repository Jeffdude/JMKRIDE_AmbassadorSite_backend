const { processMode } = require('../environment.js');
const { logInfo, logError } = require('../modules/errors.js');

const constantModel = require('./model.js');

const userConstants = require('../users/constants.js');
const userModel = require('../users/model.js');
const userLib = require('../users/lib.js');

const challengeConstants = require('../challenges/constants.js');
const challengeModel = require('../challenges/model.js');

const partModel = require('../inventory/model.js');
const partConstants = require('../inventory/constants.js');


/*
 * createConstantPromise
 *  constantName [String]: unique name of the constant to create
 *  creationFn [Fn]: 
 *    function that takes constant's data, returns created mongoose document
 *  data [Object]: data to create the constant with
 */
const createConstantPromise = (
  constantName, creationFn, data,
) => {
  return new Promise((resolve, reject) => {
    creationFn(data)
      .then((res) => {
        if(! res) {
          reject(new Error('Failed to create constant:', constantName, data, res));
        }
        if(res._id) {
          constantModel.createConstant({
            name: constantName,
            id: res._id,
          }).then(() => {
            logInfo('[+] Created constant:', constantName);
            resolve([constantName, res]);
          })
          .catch(err => {
            logError('[!] Error creating Constant mongoose document');
            reject(err);
          });
        } else {
          reject(new Error('Failed to create constant:', constantName, data, res.error));
        }
      })
      .catch(err => {
        logError('[!] Error creating', constantName, ':', err.message);
        reject(err);
      });
  });
};

const adminUserConstantInitializer = () => createConstantPromise(
  'adminUser',
  (userData) => userLib.createUser(userData),
  userConstants.adminUserData,
)

class baseConstantsInitializer {
  constructor(){
    this.initializers = {
      'adminUser': adminUserConstantInitializer,
    }
  }
}

class ambassadorsiteConstantsInitializer extends baseConstantsInitializer {
  constructor() {
    super();
    this.initializers['ambassadorApplication'] = () => createConstantPromise(
      'ambassadorApplication',
      challengeModel.createChallenge,
      challengeConstants.ambassadorApplicationData,
    );
  }
}

class stocktrackerConstantsInitializer extends baseConstantsInitializer {
  constructor() {
    super();
    partConstants.allParts.forEach(part => this.initializers[part.name] = () => 
      createConstantPromise(
        part.name,
        (partData) => partModel.createPart(partData),
        part,
      )
    );
  }
}

module.exports = {
  ambassadorsite: ambassadorsiteConstantsInitializer,
  stocktracker: stocktrackerConstantsInitializer,
}[processMode];
