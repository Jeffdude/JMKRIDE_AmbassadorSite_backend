const challengeModel = require('./model.js')

const { controller_run } = require('../modules/templates.js');


exports.create = (req, res) => {
  controller_run(req, res)(
    () => challengeModel.createChallenge(req.body),
    (result) => {res.status(201).send({id: result._id})},
  );
}

exports.getById = (req, res) => {
  controller_run(req, res)(
    () => challengeModel.getChallengeById(req.params.challengeId),
    (result) => {res.status(201).send(result)},
  );
}

exports.submitChallenge = (req, res) => {
  controller_run(req, res)(
    () => challengeModel.submitChallenge(req.params.challengeId, req.body),
    () => res.status(201).send(),
  );
}
