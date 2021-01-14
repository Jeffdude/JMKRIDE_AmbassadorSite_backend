const inventoryLib = require('./lib.js');

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
