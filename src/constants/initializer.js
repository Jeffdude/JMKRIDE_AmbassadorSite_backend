const { processMode, operationMode } = require('../environment.js');
const { permissionLevels } = require('../constants.js');

const constantsModel = require('./model.js');
const BaseConstantsInitializer = require('./initializer-base.js');

const userConstants = require('../users/constants.js');
const userModel = require('../users/model.js');
const userLib = require('../users/lib.js');

const challengeConstants = require('../challenges/constants.js');
const challengeModel = require('../challenges/model.js');

const inventoryModel = require('../inventory/model.js');
const inventoryLib = require('../inventory/lib.js');
const inventoryConstants = require('../inventory/constants.js');


class AmbassadorsiteConstantsInitializer extends BaseConstantsInitializer {
  constructor() {
    super();
    this.initializers['ambassadorApplication'] = [
      'ambassadorApplication', 'challenge',
      challengeModel.createChallenge,
      challengeConstants.ambassadorApplicationData,
    ];


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


class StocktrackerConstantsInitializer extends BaseConstantsInitializer {
  constructor() {
    super();
    this.postSetup = inventoryLib.postSetup;

    if(["development", "unittest"].includes(operationMode)) {
      /* create test users */
      this.initializers = {
        ...this.initializers,
        'testNobody': [
          'testNobody', 'user',
          (data) => userLib.createUser(data),
          userConstants.testNobodyData,
        ],
        'testUser': [
          'testUser', 'user',
          (data) => userLib.createUser(data),
          userConstants.testUserData,
        ],
        'testAmbassador': [
          'testAmbassador', 'user',
          (data) => userLib.createUser(data),
          userConstants.testAmbassadorData,
        ],
      };
    }

    /* create parts */
    inventoryConstants.allParts.forEach(part => this.initializers[part.name] = [
      part.name, 'part',
      (partData) => inventoryModel.createPart(partData),
      part,
    ]);
    /* create categories */
    inventoryConstants.categories.forEach(category =>
      this.initializers[category] = [
        category, 'category',
        (categoryName) => inventoryModel.createCategory({name: categoryName}),
        category,
      ]
    );
    /* create category sets */
    inventoryConstants.categorySets.forEach(categorySet =>
      this.initializers[categorySet] = [
        categorySet, 'categorySet',
        (categorySetName) => inventoryModel.createCategorySet({name: categorySetName}),
        categorySet,
      ]
    );
    /* create inventories */
    inventoryConstants.inventories.forEach(inventory =>
      this.initializers[inventory] = [
        inventory, 'inventory',
        (inventoryName) => inventoryModel.createInventory({name: inventoryName}),
        inventory,
      ]
    );
    /* create CS sets */
    inventoryConstants.CSSets.forEach(CSSet =>
      this.initializers[CSSet] = [
        CSSet, 'CSSet',
        (CSSetName) => inventoryModel.createCSSet({name: CSSetName}),
        CSSet,
      ]
    );

    let defaultInventory = inventoryConstants.defaultDefaultInventory;
    let defaultCategorySet = inventoryConstants.defaultDefaultCategorySet;
    let defaultCSSet = inventoryConstants.defaultDefaultCSSet;
    const getUserDefaults = (resultMap) => {
      let patchData = {};
      if(Object.hasOwnProperty.call(resultMap, defaultInventory)) {
        patchData.defaultInventory = resultMap[defaultInventory].id;
      }
      if(Object.hasOwnProperty.call(resultMap, defaultCategorySet)) {
        patchData.defaultCategorySet = resultMap[defaultCategorySet].id;
      }
      if(Object.hasOwnProperty.call(resultMap, defaultCSSet)) {
        patchData.defaultCSSet = resultMap[defaultCSSet].id;
      }
      return patchData;
    }
    const users = {
      testNobody: permissionLevels.NONE,
      testUser: permissionLevels.USER,
      testAmbassador: permissionLevels.AMBASSADOR,
      adminUser: permissionLevels.ADMIN,
    }
    this.postProcessors.push(
      // set permissionLevels, defaultInventory, defaultCategorySet
      // for all users
      ...Object.entries(users).map(([user, permissionLevel]) => (resultMap) =>
        new Promise((resolve, reject) => {
          if(Object.hasOwnProperty.call(resultMap, user)){
            let patchData = {
              ...getUserDefaults(resultMap),
              permissionLevel,
            };
            userModel.patchUser(resultMap[user]._id, patchData)
              .then(userModel.setUserSettings(
                resultMap[user]._id,
                userConstants.defaultStocktrackerUserSettings,
              ))
              .then(resolve)
              .catch(reject)
          } else {
            resolve()
          }
        })
      ),
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
  ambassadorsite: AmbassadorsiteConstantsInitializer,
  stocktracker: StocktrackerConstantsInitializer,
}[processMode];
