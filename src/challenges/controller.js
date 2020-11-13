const challengeModel = require('./model.js')

const {
  sendAndPrintErrorFn,
  sendAndPrintError
} = require('../modules/errors.js');


exports.create = (req, res) => {
  try {
    challengeModel.createChallenge(req.body).then((result) => {
      res.status(201).send({id: result._id});
    }).catch(sendAndPrintErrorFn(res));
  } catch (err) {
    sendAndPrintError(err, res);
  }
}

exports.getById = (req, res) => {
  try {
    challengeModel.getChallengeById(req.params.challengeId).then((result) => {
      res.status(201).send(result);
    }).catch(sendAndPrintErrorFn(res));
  } catch (err) {
    sendAndPrintError(err, res);
  }
}

exports.submitChallenge = (req, res) => {
  try {
    challengeModel.submitChallenge(req.params.challengeId, req.body)
    .then(() => res.status(201).send())
    .catch(sendAndPrintErrorFn(res));
  } catch (err) {
    sendAndPrintError(err, res);
  }
}
