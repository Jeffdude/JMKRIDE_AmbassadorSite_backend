const inventoryLib = require('./lib.js');
const inventoryModel = require('./model.js');

const { controller_run } = require('../modules/templates.js');

exports.createPart = (req, res) => {
  controller_run(req, res)(
    () => inventoryLib.createPart({...req.body, actor: req.jwt.userId}),
    (result) => res.status(201).send({id: result._id}),
  );
}

exports.patchById = (req, res) => {
  controller_run(req, res)(
    () => inventoryLib.updatePartQuantity(
      {partId: req.params.partId, quantity: req.body.quantity, actor: req.jwt.userId}
    ),
    (result) => res.status(200).send({result})
  )
}

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

exports.getAllInventories = (req, res) =>
  controller_run(req,res)(
    () => inventoryModel.getAllInventories(),
    (result) => res.status(200).send({result}),
  )

exports.getCategoriesByCategorySet = (req, res) =>
  controller_run(req, res)(
    () => inventoryModel.getCategoriesByCategorySet({
      categorySetId: req.params.categorySetId,
    }),
    (result) => res.status(200).send({result}),
  );

exports.debug = () => inventoryModel.debug();


