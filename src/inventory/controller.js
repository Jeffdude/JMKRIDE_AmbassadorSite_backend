const inventoryLib = require('./lib.js');
const inventoryModel = require('./model.js');

const { controller_run } = require('../modules/templates.js');

exports.createPart = (req, res) => {
  controller_run(req, res)(
    () => inventoryLib.createPart({...req.body, actor: req.jwt.userId}),
    (result) => res.status(201).send({id: result._id}),
  );
}

exports.getPart = (req, res) => 
  controller_run(req, res)(
    () => inventoryModel.getPartById(req.params.partId),
    (result) => res.status(200).send({result})
  )

exports.getPartWithQuantity = (req, res) => 
  controller_run(req, res)(
    () => inventoryModel.getPartById(req.params.partId).lean().then(
      result => [result]
    ).then(
      inventoryLib.setPartResultsQuantity(req.params.inventoryId),
    ).then(result => result[0]),
    (result) => res.status(200).send({result})
  )

exports.patchPart = () => undefined;

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
      partOrder: req.body.partOrder,
    }),
    () => res.status(200).send({result: true}),
  );

exports.getAllInventories = (req, res) =>
  controller_run(req,res)(
    () => inventoryModel.getAllInventories(),
    (result) => res.status(200).send({result}),
  )

exports.getCategoriesByCategorySet = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getCategoriesByCategorySet({
      categorySetId: req.params.categorySetId,
    }).then(inventoryLib.setCategorySortIndex(req.params.categorySetId)),
    (result) => res.status(200).send({result}),
  );

exports.getLogsByCategory = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getLogsByCategory({
      categoryId: req.params.categoryId,
      perPage: req.query.perPage,
      page: req.query.page,
    }),
    (result) => res.status(200).send({result}),
  );

exports.getLogsByPart = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getLogsByPart({
      partId: req.params.partId,
      perPage: req.query.perPage,
      page: req.query.page,
    }),
    (result) => {
      console.log(result);
      res.status(200).send({result})
    }
  );

exports.debug = () => inventoryModel.debug();


