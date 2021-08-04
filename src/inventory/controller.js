const inventoryLib = require('./lib.js');
const inventoryModel = require('./model.js');
const inventoryConstants = require('./constants.js');

const userModel = require('../users/model.js');

const { controller_run } = require('../modules/templates.js');

exports.createPart = (req, res) => {
  controller_run(req, res)(
    () => inventoryLib.createPartWithCategories({
      ...req.body,
      actor: req.jwt.userId,
      inventoryId: req.params.inventoryId,
    }),
    (result) => res.status(201).send({id: result._id}),
  );
}

exports.getPart = (req, res) => 
  controller_run(req, res)(
    () => inventoryModel.getPartById(req.params.partId).then(
      inventoryLib.redactCreatorInfo,
    ),
    (result) => res.status(200).send({result})
  )

exports.getPartWithQuantity = (req, res) => 
  controller_run(req, res)(
    () => inventoryModel.getPartById(req.params.partId).lean().then(
      result => [result]
    ).then(
      inventoryLib.setPartResultsQuantity(req.params.inventoryId),
    ).then(result => result[0]).then(
      inventoryLib.redactCreatorInfo,
    ),
    (result) => res.status(200).send({result})
  );

exports.deletePart = (req, res) => 
  controller_run(req, res)(
    () => inventoryModel.deletePartById(req.params.partId),
    (result) => res.status(202).send({result}),
  );

exports.getAllPartsWithQuantity = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getAllParts().lean().then(
      inventoryLib.setPartResultsQuantity(req.params.inventoryId),
    ),
    (result) => res.status(200).send({result})
  );
exports.searchAllPartsWithQuantity = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.searchAllParts(req.body.query).lean().then(
      inventoryLib.setPartResultsQuantity(req.params.inventoryId),
    ),
    (result) => res.status(200).send({result}),
  );


exports.patchPart = (req, res) =>
  controller_run(req, res)(
    () => inventoryLib.patchPart({
      actor: req.jwt.userId,
      partId: req.params.partId,
      ...req.body
    }),
    (result) => res.status(201).send({result})
  );

exports.updatePartQuantity = (req, res) => 
  controller_run(req, res)(
    () => inventoryLib.updatePartQuantity({
      partId: req.params.partId,
      inventoryId: req.params.inventoryId,
      quantity: req.body.quantity,
      actor: req.jwt.userId,
    }),
    (result) => res.status(201).send({result})
  );

exports.getCategory = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getCategoryById(req.params.categoryId),
    (result) => res.status(200).send({result}),
  );

exports.getPartsByCategory = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getPartsByCategory(
      { categoryId: req.params.categoryId}
    ).then(inventoryLib.setPartResultsQuantity(req.params.inventoryId)),
    (result) => res.status(200).send({result})
  );

exports.getCategorySetById = (req, res) =>
  controller_run(req,res)(
    () => inventoryModel.getCategorySetById(req.params.categorySetId),
    (result) => res.status(200).send({result}),
  );

exports.getAllCategorySets = (req, res) =>
  controller_run(req,res)(
    () => inventoryModel.getAllCategorySets(),
    (result) => res.status(200).send({result}),
  )

exports.setCategoryPartOrder = (req, res) =>
  controller_run(req,res)(
    () => inventoryLib.setCategoryPartOrder({
      categoryId: req.params.categoryId,
      itemOrder: req.body.itemOrder,
    }),
    () => res.status(200).send({result: true}),
  );

exports.getAllInventories = (req, res) =>
  controller_run(req,res)(
    () => inventoryModel.getAllInventories(),
    (result) => res.status(200).send({result}),
  );

exports.getCategoriesByCategorySet = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getCategoriesByCategorySet({
      categorySetId: req.params.categorySetId,
    }),
    (result) => res.status(200).send({result}),
  );
exports.getAllCategories = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getAllCategories(),
    (result) => res.status(200).send({result}),
  );

exports.getLogsByCategory = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getLogsByCategory({
      categoryId: req.params.categoryId,
      perPage: Number(req.query.perPage),
      page: Number(req.query.page),
    }),
    (result) => res.status(200).send({result}),
  );
exports.getAllLogs = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getLogs({
      perPage: Number(req.query.perPage),
      page: Number(req.query.page),
    }),
    (result) => res.status(200).send({result})
  );
exports.getLogsByPart = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getLogsByPart({
      partId: req.params.partId,
      perPage: Number(req.query.perPage),
      page: Number(req.query.page),
    }),
    (result) => res.status(200).send({result})
  );
exports.getLogsByUser = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getLogsByUser({
      userId: req.params.userId,
      perPage: Number(req.query.perPage),
      page: Number(req.query.page),
    }),
    (result) => res.status(200).send({result}),
  )

exports.getAllCSSets = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getAllCSSets(),
    (result) => res.status(200).send({result}),
  );
exports.getCSSetById = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getCSSetById(req.params.CSSetId),
    (result) => res.status(200).send({result}),
  );
exports.createCompleteSet = (req, res) =>
  controller_run(req, res)(
    () => inventoryLib.createCompleteSetWithCSSets({...req.body, actor: req.jwt.userId}),
    (result) => res.status(201).send({result}),
  );
exports.patchCompleteSet = (req, res) =>
  controller_run(req, res)(
    () => inventoryLib.patchCompleteSetWithCSSets(
      {...req.body, actor: req.jwt.userId, completeSetId: req.params.completeSetId}
    ),
    (result) => res.status(201).send({result}),
  );
exports.withdrawCompleteSet = (req, res) =>
  controller_run(req, res)(
    async () => await Promise.all(inventoryConstants.CSPropertyList.map(
      prop => inventoryLib.updatePartQuantity({
        partId: req.body[prop], 
        inventoryId: req.params.inventoryId, 
        quantity: (-1 * Number(req.body.quantity)),
        actor: req.jwt.userId,
      })
    )),
    (result) => res.status(201).send({result}),
  );

exports.getCompleteSetsByCSSetId = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getCompleteSets({CSSetId: req.params.CSSetId}).then(
      results => results.map(inventoryLib.addCompleteSetHelperInfo(
        req.params.inventoryId,
      )),
    ).then(results => results.map(inventoryLib.redactCreatorInfo)),
    (result) => res.status(200).send({result}),
  );
exports.getCompleteSets = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getAllCompleteSets().then(
      results => results.map(inventoryLib.addCompleteSetHelperInfo(
        req.params.inventoryId,
      )),
    ).then(results => results.map(inventoryLib.redactCreatorInfo)),
    (result) => res.status(200).send({result}),
  );
exports.getCompleteSetById = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getCompleteSetById(req.params.completeSetId).then(
      result => result.toObject()
    ).then(
      inventoryLib.addCompleteSetHelperInfo(req.params.inventoryId)
    ).then(inventoryLib.redactCreatorInfo),
    (result) => res.status(200).send({result}),
  );
exports.updateCompleteSetQuantity = (req, res) =>
  controller_run(req, res)(
    () => inventoryLib.updateCompleteSetQuantity({
      completeSetId: req.params.completeSetId, 
      inventoryId: req.params.inventoryId,
      quantity: req.body.quantity,
      actor: req.jwt.userId,
    }),
    (result) => res.status(201).send({result}),
  );
exports.patchCSSet = (req, res) => 
  controller_run(req,res)(
    () => inventoryLib.patchCSSetWithCSIds(
      {...req.body, actor: req.jwt.userId, CSSetId: req.params.CSSetId}
    ),
    (result) => res.status(201).send({result}),
  );
exports.createCSSet = (req, res) =>
  controller_run(req, res)(
    () => inventoryLib.createCSSetWithCSIds({...req.body, actor: req.jwt.userId}),
    ({result}) => res.status(201).send({result}),
  );
exports.deleteCSSet = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.deleteCSSet(req.params.CSSetId).then(
      doc => inventoryConstants.getDefaultDefaultCSSetId()
        .then(defaultCSSetId => userModel.handleDeletedDefault({
          propName: "defaultCSSet",
          id: req.params.CSSetId,
          replacement: defaultCSSetId,
        })).then(() => inventoryLib.handleDeletedCSSet(req.params.CSSetId)
        ).then(() => doc)
    ),
    () => res.status(201).send({result: true}),
  )
exports.setCSSetCSOrder = (req, res) =>
  controller_run(req,res)(
    () => inventoryLib.setCSSetCSOrder({
      CSSetId: req.params.CSSetId,
      itemOrder: req.body.itemOrder,
    }),
    () => res.status(200).send({result: true}),
  );
exports.deleteCS = (req, res) =>
  controller_run(req,res)(
    () => inventoryModel.deleteCS(req.params.completeSetId),
    () => res.status(200).send({result: true}),
  );
exports.patchCategorySet = (req, res) =>
  controller_run(req,res)(
    () => inventoryLib.patchCategorySetWithCategoryIds(
      req.params.categorySetId, {...req.body, actor: req.jwt.userId}
    ),
    (result) => res.status(201).send({result}),
  );
exports.deleteCategorySet = (req, res) =>
  controller_run(req,res)(
    () => inventoryModel.deleteCategorySet(req.params.categorySetId).then(
      doc => inventoryConstants.getDefaultDefaultCategorySetId()
        .then(defaultCategorySetId => userModel.handleDeletedDefault({
          propName: "defaultCategorySet",
          id: req.params.categorySetId,
          replacement: defaultCategorySetId,
        })).then(() => inventoryLib.handleDeletedCategorySet(req.params.categorySetId)
        ).then(() => doc)
    ),
    (result) => res.status(200).send({result}),
  );
exports.createCategorySet = (req, res) =>
  controller_run(req,res)(
    () => inventoryLib.createCategorySetWithCategoryIds(
      {...req.body, actor: req.jwt.userId}
    ),
    (result) => res.status(201).send({result}),
  );
exports.setCategorySetOrder = (req, res) =>
  controller_run(res,res)(
    () => inventoryLib.setCategorySetCategoryOrder(
      {categorySetId: req.params.categorySetId, itemOrder: req.body.itemOrder},
    ),
    () => res.status(200).send({result: true}),
  );
exports.createCategory = (req, res) =>
  controller_run(res,res)(
    () => inventoryLib.createCategory({actor: req.jwt.userId, ...req.body}),
    (result) => res.status(201).send({result}),
  );
exports.patchCategory = (req, res) =>
  controller_run(res,res)(
    () => inventoryLib.patchCategory(
      req.params.categoryId,
      {actor: req.jwt.userId, ...req.body}
    ),
    (result) => res.status(201).send({result}),
  );
exports.deleteCategory = (req, res) =>
  controller_run(res,res)(
    () => inventoryModel.deleteCategory(
      req.params.categoryId,
      {actor: req.jwt.userId, ...req.body}
    ).then(doc => inventoryLib.handleDeletedCategory(
      req.params.categoryId
    ).then(() => doc)),
    (result) => res.status(201).send({result}),
  );
