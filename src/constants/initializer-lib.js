const constantsModel = require('./model.js');
const { permissionLevels } = require('../constants.js');
const userConstants = require('../users/constants.js');
const userLib = require('../users/lib.js');
const userModel = require('../users/model.js');
const { logInfo, logError } = require('../modules/errors.js');


/*
 * createConstantPromise
 *  Fn(
 *    constantName::String - unique name of the constant to create
 *    type::String - mongodb model name 
 *    creationFn::Fn (data::Object => Promise(mongoose document))
 *      - function that takes constant's data, returns Promise to create mongoose document
 *      - will be 'await'ed
 *    data::Object - data to create the constant with
 *  => 
 *    Promise(mongoosedocument)
 *  )
 */
const createConstantPromise = (
  constantName, type, creationFn, data,
) => {
  return new Promise((resolve, reject) => {
    creationFn(data)
      .then((res) => {
        if(! res) {
          reject(new Error('Failed to create constant:', constantName, data, res));
        }
        if(res._id) {
          constantsModel.createConstant({
            name: constantName,
            id: res._id,
            type: type,
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


class BaseConstantsInitializer {
  constructor(){
    /*
     * initializers::Map(
     *   constantName::String : initializerFn::Fn(null => Promise(mongoose document))
     * )
     */
    this.initializers = {
      'adminUser': () => createConstantPromise( 
        'adminUser', 'user',
        (userData) => userLib.createUser(userData),
        userConstants.adminUserData,
      ),
    };
    /*
     * postProcessors::[Fn(
     *   resultMap::Map(constantName::String : mongoose document) => Promise(*)
     * )]
     */
    this.postProcessors = [
      // set adminUser's permissions to Admin
      (resultMap) => new Promise((resolve, reject) => {
        if(Object.hasOwnProperty.call(resultMap, 'adminUser')){
          userModel.patchUser(
            resultMap['adminUser']._id,
            {permissionLevel: permissionLevels.ADMIN},
          )
            .then(resolve)
            .catch(reject)
        } else {
          resolve()
        }
      }),
    ];
    /*
     * postSetup::[Fn(null=>Promise(*))]
     */
    this.postSetup = [];
  }
}

module.exports = {
  createConstantPromise,
  BaseConstantsInitializer,
}
