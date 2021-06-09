const inventoryModel = require('./model.js');
const { inventoryActions } = require('./constants.js');

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

exports.sortAllCategories = async () =>
  inventoryModel.getAllCategories().then(categories => Promise.all(
    categories.map(category =>
      exports.sortCategory({categoryId: category._id})
    )
  ));


exports.debug = () => exports.sortCategory({categoryId: "609c3a19f0bbf1efaa2e1ea7"});
