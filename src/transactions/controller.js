const transactionModel = require('./model.js');
const transactionLib = require('./lib.js');

const { controller_run } = require('../modules/templates.js');


exports.getTransactions = (req, res) => 
  controller_run(req,res)(
    () => transactionLib.getTransactions(
      {
        userId: req.query.userId,
        submissionId: req.query.submissionId,
      }
    ),
    (result) => res.status(200).send(result),
  );

exports.recalculateBalance = (req, res) => 
  controller_run(req, res)(
    () => transactionLib.calculateUserBalance(req.params.userId),
    () => res.status(200).send(),
  )

exports.getReferralCodes = (req, res) =>
  controller_run(req, res)(
    () => transactionModel.getReferralCode({userId: req.query.userId}),
    (result) => res.status(200).send(result),
  )

exports.createReferralCode = (req, res) =>
  controller_run(req, res)(
    () => transactionModel.createReferralCode(
      {
        code: req.body.code,
        percent: req.body.percent,
        owner: req.body.owner,
      }
    ),
    () => res.status(201).send(),
  );
