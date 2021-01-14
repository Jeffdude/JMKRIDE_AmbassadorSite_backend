const inventoryModel = require('./model.js');

const { controller_run } = require('../modules/templates.js');

exports.createPart = (req, res) => {
  controller_run(req, res)(
    () => inventoryModel.createPart({...req.body, creator: req.jwt.userId}),
    (result) => res.status(201).send({id: result._id}),
  );
}
