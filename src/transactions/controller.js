const transactionModel = require('./model.js');
const transactionLib = require('./lib.js');

const { controller_run } = require('../modules/templates.js');


exports.getTransactions = (req, res) => 
  controller_run(req,res)(
    () => transactionModel.getTransactions(
      {
        any: req.query.userId,
        submissionId: req.query.submissionId,
        referralCodeId: req.query.referralCodeId,
        populate: req.query.populate,
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
    () => transactionModel.getReferralCode(
      {
        userId: req.query.userId,
        id: req.query.id,
      }
    ),
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

exports.getAllReferralCodes = (req, res) =>
  controller_run(req, res)(
    transactionModel.getAllReferralCodes,
    (result) => res.status(200).send(result),
  )

exports.createReferralCodeUsage = (req, res) => 
  controller_run(req, res)(
    () => transactionLib.createReferralCodeUsage({
      code: req.body.code,
      total: Number(req.body.total),
      orderNumber: Number(req.body.orderNumber),
    }),
    () => res.status(201).send(),
  );

exports.createAdminTransaction = (req, res) =>
  controller_run(req, res)(
    () => transactionLib.createAdminTransaction({
      amount: req.body.amount,
      user: req.body.user,
      reason: req.body.reason,
    }),
    () => res.status(201).send(),
  );
