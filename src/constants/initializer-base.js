const constantsModel = require('./model.js');
const { permissionLevels } = require('../constants.js');
const userConstants = require('../users/constants.js');
const userLib = require('../users/lib.js');
const userModel = require('../users/model.js');
const { logInfo, logError } = require('../modules/errors.js');


module.exports = class BaseConstantsInitializer {
  constructor(){
    /*
     * initializers::Map(
     *   constantName::String : [
     *     constantName::String - unique name of the constant to create
     *     type::String - mongodb model name 
     *     creationFn::Fn (data::Object => Promise(mongoose document))
     *       - function that takes constant's data, returns Promise to create mongoose document
     *       - will be 'await'ed
     *     data::Object - data to create the constant with
     *   ]
     * )
     */
    this.initializers = {
      'adminUser': [
        'adminUser', 'user',
        (userData) => userLib.createUser(userData),
        userConstants.adminUserData,
      ],
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