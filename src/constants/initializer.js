const { processMode, operationMode } = require('../environment.js');
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
    this.postSetup = [];
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
    this.postSetup = inventoryLib.postSetup;

    if(["development", "unittest"].includes(operationMode)) {
      /* create test users */
      this.initializers['testNobody'] = () => createConstantPromise(
        'testNobody', 'user',
        (data) => userLib.createUser(data),
        userConstants.testNobodyData,
      );
      this.initializers['testUser'] = () => createConstantPromise(
        'testUser', 'user',
        (data) => userLib.createUser(data),
        userConstants.testUserData,
      );
      this.initializers['testAmbassador'] = () => createConstantPromise(
        'testAmbassador', 'user',
        (data) => userLib.createUser(data),
        userConstants.testAmbassadorData,
      );
    }

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
        (categorySetName) => inventoryModel.createCategorySet({name: categorySetName}),
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

    let defaultInventory = inventoryConstants.defaultDefaultInventory;
    let defaultCategorySet = inventoryConstants.defaultDefaultCategorySet;
    this.postProcessors.push(
      // set permissionLevels, defaultInventory, defaultCategorySet
      // for all test users
      (resultMap) => new Promise((resolve, reject) => {
        if(Object.hasOwnProperty.call(resultMap, 'testNobody')){
          let patchData = {permissionLevel: permissionLevels.NONE};
          if(Object.hasOwnProperty.call(resultMap, defaultInventory)) {
            patchData.defaultInventory = resultMap[defaultInventory].id;
          }
          if(Object.hasOwnProperty.call(resultMap, defaultCategorySet)) {
            patchData.defaultCategorySet = resultMap[defaultCategorySet].id;
          }
          userModel.patchUser(resultMap['testNobody']._id, patchData)
            .then(resolve)
            .catch(reject)
        } else {
          resolve()
        }
      }),
      (resultMap) => new Promise((resolve, reject) => {
        if(Object.hasOwnProperty.call(resultMap, 'testUser')){
          let patchData = {permissionLevel: permissionLevels.USER};
          if(Object.hasOwnProperty.call(resultMap, defaultInventory)) {
            patchData.defaultInventory = resultMap[defaultInventory].id;
          }
          if(Object.hasOwnProperty.call(resultMap, defaultCategorySet)) {
            patchData.defaultCategorySet = resultMap[defaultCategorySet].id;
          }
          userModel.patchUser(resultMap['testUser']._id, patchData)
            .then(resolve)
            .catch(reject)
        } else {
          resolve()
        }
      }),
      (resultMap) => new Promise((resolve, reject) => {
        if(Object.hasOwnProperty.call(resultMap, 'testAmbassador')){
          let patchData = {permissionLevel: permissionLevels.AMBASSADOR};
          if(Object.hasOwnProperty.call(resultMap, defaultInventory)) {
            patchData.defaultInventory = resultMap[defaultInventory].id;
          }
          if(Object.hasOwnProperty.call(resultMap, defaultCategorySet)) {
            patchData.defaultCategorySet = resultMap[defaultCategorySet].id;
          }
          userModel.patchUser(resultMap['testAmbassador']._id, patchData)
            .then(resolve)
            .catch(reject)
        } else {
          resolve()
        }
      }),
      // set defaultInventory, defaultCategorySet for adminUser
      (resultMap) => new Promise((resolve, reject) => {
        if(Object.hasOwnProperty.call(resultMap, 'adminUser')){
          let patchData = {};
          if(Object.hasOwnProperty.call(resultMap, defaultInventory)) {
            patchData.defaultInventory = resultMap[defaultInventory].id;
          }
          if(Object.hasOwnProperty.call(resultMap, defaultCategorySet)) {
            patchData.defaultCategorySet = resultMap[defaultCategorySet].id;
          }
          userModel.patchUser(resultMap['adminUser']._id, patchData)
            .then(resolve)
            .catch(reject)
        } else {
          resolve()
        }
      }),
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
    /* set categorySet for all categories */
    inventoryConstants.categories.forEach(category => {
      this.postProcessors.push(async (resultMap) => {
        if(Object.hasOwnProperty.call(resultMap, category)) {
          let defaultCategorySetName = inventoryConstants.defaultDefaultCategorySet;
          let patchData;
          if(Object.hasOwnProperty.call(resultMap, defaultCategorySetName)) {
            patchData = {categorySets:
              [{sortIndex: 0, categorySet: resultMap[defaultCategorySetName].id}]
            };
          } else {
            patchData = {categorySets: [{
              sortIndex: 0,
              categorySet: await constantsModel.getByName(
                defaultCategorySetName,
              ).id
            }]};
          }
          return inventoryModel.patchCategory(resultMap[category].id, patchData);
        }
      })
    });
  }
}

module.exports = {
  ambassadorsite: ambassadorsiteConstantsInitializer,
  stocktracker: stocktrackerConstantsInitializer,
}[processMode];
