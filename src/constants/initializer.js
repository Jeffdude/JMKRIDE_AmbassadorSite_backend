const { processMode } = require('../environment.js');
const { permissionLevels } = require('../constants.js');
const { logInfo, logError } = require('../modules/errors.js');

const constantsModel = require('./model.js');

const userConstants = require('../users/constants.js');
const userModel = require('../users/model.js');
const userLib = require('../users/lib.js');

const challengeConstants = require('../challenges/constants.js');
const challengeModel = require('../challenges/model.js');

const inventoryModel = require('../inventory/model.js');
const inventoryLib = require('../inventory/lib.js');
const inventoryConstants = require('../inventory/constants.js');


/*
 * createConstantPromise
 *  constantName [String]: unique name of the constant to create
 *  creationFn [Fn]:
 *    function that takes constant's data, returns created mongoose document
 *  data [Object]: data to create the constant with
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

const adminUserConstantInitializer = () => createConstantPromise(
  'adminUser', 'user',
  (userData) => userLib.createUser(userData),
  userConstants.adminUserData,
)

class baseConstantsInitializer {
  constructor(){
    /*
     * initializers [Map, constantName [String] : initializerFn [null => Promise]
     */
    this.initializers = {
      'adminUser': adminUserConstantInitializer,
    };
    /*
     * postProcessors [Array, postProcessFn]
     *               - Function, (resultMap [Map, contantName: document]) => Promise
     */
    this.postProcessors = [
      // set adminUser's permissions to Admin
      (resultMap) => new Promise((resolve, reject) => {
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
      }),
    ];
    this.postSetup = () => {}
  }
}

class ambassadorsiteConstantsInitializer extends baseConstantsInitializer {
  constructor() {
    super();
    this.initializers['ambassadorApplication'] = () => createConstantPromise(
      'ambassadorApplication', 'challenge',
      challengeModel.createChallenge,
      challengeConstants.ambassadorApplicationData,
    );


    this.postProcessors.push(
      // set ambassadorApplication's creator to adminUser
      (resultMap) => new Promise((resolve, reject) => {
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
      }),
    );
  }
}

class stocktrackerConstantsInitializer extends baseConstantsInitializer {
  constructor() {
    super();
    /* create parts */
    inventoryConstants.allParts.forEach(part => this.initializers[part.name] = () =>
      createConstantPromise(
        part.name, 'part',
        (partData) => inventoryModel.createPart(partData),
        part,
      )
    );
    /* create categories */
    inventoryConstants.categories.forEach(category =>
      this.initializers[category] = () => createConstantPromise(
        category, 'category',
        (categoryName) => inventoryModel.createCategory({name: categoryName}),
        category,
      )
    );
    /* create category sets */
    inventoryConstants.categorySets.forEach(categorySet =>
      this.initializers[categorySet] = () => createConstantPromise(
        categorySet, 'categorySet',
        (categorySetName) => inventoryModel.createCategory({name: categorySetName}),
        categorySet,
      )
    );
    /* create inventories */
    inventoryConstants.inventories.forEach(inventory =>
      this.initializers[inventory] = () => createConstantPromise(
        inventory, 'inventory',
        (inventoryName) => inventoryModel.createInventory({name: inventoryName}),
        inventory,
      )
    );
    /* set creator, category of all parts */
    inventoryConstants.allParts.forEach(part => {
      this.postProcessors.push(async (resultMap) => {
        if(Object.hasOwnProperty.call(resultMap, part.name)) {
          let categoryConstant = await constantsModel.getByName(part.categoryName);
          let category = await inventoryModel.getCategoryById(categoryConstant.id);
          let adminUser = await constantsModel.getByName('adminUser');
          let patchData = {
            categories: [{sortIndex: 0, category: category}],
            creator: adminUser.id,
          }
          return inventoryModel.patchPart(resultMap[part.name]._id, patchData)
        }
      })
    });
    this.postSetup = inventoryLib.sortAllCategories;
  }
}

module.exports = {
  ambassadorsite: ambassadorsiteConstantsInitializer,
  stocktracker: stocktrackerConstantsInitializer,
}[processMode];
