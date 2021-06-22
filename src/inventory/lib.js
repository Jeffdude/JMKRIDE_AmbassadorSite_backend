const inventoryModel = require('./model.js');
const { inventoryActions } = require('./constants.js');
const { operationMode } = require('../environment.js');

const executeThenLog = (fn, { action, actor, payload}) =>
  fn().then(doc =>
    inventoryModel.createLog({
      actor: actor,
      action: action,
      subject: doc._id,
      subjectType: doc.constructor.modelName,
      payload: payload,
    })
  );

/* createPartWithCategories
 *  categoryIds - [categoryIds]
 */
exports.createPartWithCategories = ({actor, categoryIds, ...partData}) => {
  partData.categories = [];
  Promise.all(categoryIds.forEach(categoryId =>
    inventoryModel.getCategoryById(categoryId).then(category =>
      partData.categories.push({sortIndex: category.length, category: category._id})
    )
  )).then(exports.createPart({actor, partData}))
}

exports.createPart = ({actor, ...partData}) =>
  executeThenLog(
    () => inventoryModel.createPart(partData),
    {
      action: inventoryActions.CREATE,
      actor: actor,
      payload: partData,
    }
  );

exports.patchPart = ({actor, partId, ...partData}) =>
  executeThenLog(
    () => inventoryModel.patchPart(partId, partData),
    {
      action: inventoryActions.MODIFY,
      actor: actor,
      payload: partData,
    }
  );


exports.updatePartQuantity = (actor, payload) =>
  executeThenLog(
    () => inventoryModel.updatePartQuantity(payload),
    {
      action: inventoryActions.UPDATE,
      actor: actor,
      payload: payload,
    },
  );

exports.createCategory = (actor, categorySetIds, payload) => {
  let allCategorySetOrders = []
  const categorySets = inventoryModel.getCategorySetsById(categorySetIds);
  categorySets.forEach(
    category => allCategorySetOrders.push(
      {category: category._id, sortIndex: category.length}
    )
  );
  payload.categorySets = allCategorySetOrders;
  executeThenLog(
    () => inventoryModel.createCategory(payload),
    {
      action: inventoryActions.UPDATE,
      actor: actor,
      payload: payload,
    },
  );
}

exports.sortCategory = async ({categoryId}) => {
  const allPartIds = (
    await inventoryModel.getPartsByCategory({categoryId})
  ).map((doc) => doc._id);
  return await Promise.all(
    allPartIds.map(async (id, index) =>
      inventoryModel.setPartCategoryOrder({
        partId: id, categoryId: categoryId, sortIndex: index
      })
    )
  );
}

exports.sortCategorySet = async ({categorySetId}) => {
  const allCategoryIds = (
    await inventoryModel.getCategoriesByCategorySet({categorySetId})
  ).map((doc) => doc._id);
  return await Promise.all(
    allCategoryIds.map((id, index) =>
      inventoryModel.setCategoryCategorySetOrder({
        categoryId: id, categorySetId: categorySetId, sortIndex: index,
      })
    )
  );
}

exports.postSetup = async () => {
  /* sort all categories */
  await inventoryModel.getAllCategories().then(categories => Promise.all(
    categories.map(category =>
      exports.sortCategory({categoryId: category._id})
    )
  ));
  /* sort all categorysets */
  await inventoryModel.getAllCategorySets().then(categorySets => Promise.all(
    categorySets.map(categorySet =>
      exports.sortCategorySet({categorySetId: categorySet._id})
    )
  ));

  /* initialize all uninitialized inventories */
  await inventoryModel.getAllInventories().then(inventories =>
    Promise.all(inventories.map((inventory) => {
      if(!inventory.initialized) {
        inventoryModel.getAllParts().then(parts => Promise.all(
          parts.map(part => inventoryModel.updatePartQuantity(
            {
              partId: part._id,
              inventoryId: inventory._id,
              quantity: (
                /* if in development mode, set random inventory amounts */
                ["development", "unittest"].includes(operationMode)
                ? Math.floor(Math.random() * 1000)
                : 0
              ) 
            },
          ))
        )).then(() => inventoryModel.patchInventory(inventory._id, {initialized: true}))
      }
    }))
  )
}

/*
 * adds 'quantity' property to results for ease of use from client
 */
exports.setPartResultsQuantity = (inventoryId) => (parts) => {
  parts.forEach(part => {
    if(Object.hasOwnProperty.call(part.quantityMap, inventoryId)) {
      part.quantity = part.quantityMap[inventoryId];
    } else {
      part.quantity = 0;
    }
    delete(part.quantityMap);
  });
  return parts;
}


exports.debug = () => exports.sortCategory({categoryId: "609c3a19f0bbf1efaa2e1ea7"});
