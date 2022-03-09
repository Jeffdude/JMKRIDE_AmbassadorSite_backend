const transactionModel = require('./model.js');
const transactionLib = require('./lib.js');

const { permissionLevels } = require('../constants.js')
const { controller_run } = require('../modules/templates.js');
const { logError } = require('../modules/errors.js');

/*{
        eitherSubject: req.query.userId,
        transactionId: req.query.transactionId,
        submissionId: req.query.submissionId,
        referralCodeId: req.query.referralCodeId,
        referralCodeOrderNumber: req.query.referralCodeOrderNumber,
        populate: (req.query.populate === 'true'),
      }*/

exports.getTransactions = getTarget => (req, res) => 
  controller_run(req,res)(
    () => transactionModel.getTransactions(getTarget(req))
    .then(results => results.map(transaction => {
      let {source, destination} = transaction;
      if(!(source && destination)) return transaction

      source = source._id;
      destination = destination._id;

      if(source.toString() === req.jwt.userId.toString()) transaction.set(
        'delta', transaction.amount > 0 ? 'negative' : 'positive', {strict: false}
      )
      if(destination.toString() === req.jwt.userId.toString()) transaction.set(
        'delta', transaction.amount > 0 ? 'positive' : 'negative', {strict: false}
      )
      return transaction;
    })),
    (result) => {
      if(!result.map(transaction => ([
        transaction.source ? transaction.source._id.toString() : '', transaction.destination._id.toString()
      ])).every(actors => (
        actors.includes(req.jwt.userId.toString()) || req.jwt.permissionLevel == permissionLevels.ADMIN
      ))) {
        logError(
          "[!][403][transactions/controller][getTransactions] Failed: ",
          {result, userId: req.jwt.userId, permissionLevel: req.jwt.permissionLevel}
        );
        return res.status(403).send();
      }
      return res.status(200).send({result})
    },
  );

exports.recalculateBalance = (req, res) => 
  controller_run(req, res)(
    () => transactionLib.calculateUserBalance(req.params.userId),
    () => res.status(200).send(),
  )

exports.getAllReferralCodes = (req, res) => 
  controller_run(req, res)(
    () => transactionModel.getReferralCode({}),
    (result) => res.status(200).send({result}),
  )

exports.getReferralCodes = getTarget => (req, res) =>
  controller_run(req, res)(
    () => transactionModel.getReferralCode(getTarget(req)),
    (results) => {
      if(!(
        results.map(result => result.owner._id.toString()).every(id => (
          id === req.jwt.userId.toString() || req.jwt.permissionLevel == permissionLevels.ADMIN
        ))
      )){
        logError(
          "[!][403][transactions/controller][getReferralCodes] Failed: ",
          {results, userId: req.jwt.userId, permissionLevel: req.jwt.permissionLevel}
        );
        return res.status(403).send();
      }
      return res.status(200).send({ result: results })
    },
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
      total: Number(req.body.total),
      orderNumber: Number(req.body.orderNumber),
    }),
    (result) => res.status(201).send({result}),
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
