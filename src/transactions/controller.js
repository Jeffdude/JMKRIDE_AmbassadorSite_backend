const transactionModel = require('./model.js');
const transactionLib = require('./lib.js');

const { controller_run } = require('../modules/templates.js');


exports.getTransactions = (req, res) => 
  controller_run(req,res)(
    () => transactionModel.getTransactions(
      {
        eitherSubject: req.query.userId,
        transactionId: req.query.transactionId,
        submissionId: req.query.submissionId,
        referralCodeId: req.query.referralCodeId,
        referralCodeOrderNumber: req.query.referralCodeOrderNumber,
        populate: (req.query.populate === 'true'),
      }
    ).then(results => results.map(transaction => {
      let {source, destination} = transaction;
      if(req.query.populate) {
        source = source._id;
        destination = destination._id;
      }
      if(source.toString() === req.jwt.userId.toString()) transaction.set(
        'delta', transaction.amount > 0 ? 'negative' : 'positive', {strict: false}
      )
      if(destination.toString() === req.jwt.userId.toString()) transaction.set(
        'delta', transaction.amount > 0 ? 'positive' : 'negative', {strict: false}
      )
      return transaction;
    })),
    (result) => res.status(200).send({result}),
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
    (result) => res.status(200).send({ result }),
  )

exports.getReferralCodeOptions = (req, res) =>
  controller_run(req, res)(
    () => transactionModel.getReferralCode({}).then(
      results => results.map(result => ({value: result._id, label: result.code}))
    ),
    (result) => res.status(200).send({ result }),
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
    () => res.status(201).send({result: true}),
  );

exports.createReferralCodeUsage = (req, res) => 
  controller_run(req, res)(
    () => transactionLib.createReferralCodeUsage({
      codeId: req.body.code,
      code: req.body.codeName,
      total: Number(req.body.total),
      orderNumber: Number(req.body.orderNumber),
    }),
    () => res.status(201).send({result: true}),
  );

exports.createAdminTransaction = (req, res) =>
  controller_run(req, res)(
    () => transactionLib.createAdminTransaction({
      amount: req.body.amount,
      user: req.body.user,
      reason: req.body.reason,
    }),
    () => res.status(201).send({result: true}),
  );

exports.recalculateUserBalance = (req, res) =>
  controller_run(req, res)(
    () => transactionLib.calculateUserBalance(req.body.userId),
    () => res.status(200).send({result: true}),
  );
