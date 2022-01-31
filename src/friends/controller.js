const { controller_run } = require('../modules/templates.js');

const friendsModel = require('./model');


exports.createRequest = (req, res) => 
  controller_run(req, res)(
    () => friendsModel.createRequest({
      from: req.jwt.userId,
      to: req.body.toUserId,
      memo: req.body.memo,
    }),
    (result) => res.status(201).send({result}),
  )

exports.getIncomingRequests = (req, res) =>
  controller_run(req,res)(
    () => friendsModel.getRequests({
      to: req.jwt.userId,
    }),
    (result) => res.status(200).send({result}),
  )

exports.getOutgoingRequests = (req, res) =>
  controller_run(req,res)(
    () => friendsModel.getRequests({
      from: req.jwt.userId,
    }),
    (result) => res.status(200).send({result}),
  )