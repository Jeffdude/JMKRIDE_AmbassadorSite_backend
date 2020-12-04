const challengeModel = require('./model.js');
const challengeConstants = require('./constants.js');

const { controller_run } = require('../modules/templates.js');


exports.create = (req, res) => {
  controller_run(req, res)(
    () => challengeModel.createChallenge({
      ...req.body,
      creator: req.jwt.userId,
    }),
    (result) => res.status(201).send({id: result._id}),
  );
}

//exports.getAmbassadorApplication = (req, res) => {
//  controller_run(req, res)(
//    () => challengeModel.getChallengeById(challengeConstants.getAmbassadorApplicationId()),
//    (result) => res.status(200).send(result),
//  );
//}

exports.getById = (req, res) => {
  controller_run(req, res)(
    () => challengeModel.getChallengeById(req.params.challengeId),
    (result) => res.status(200).send(result),
  );
}

exports.submitChallenge = (req, res) => {
  controller_run(req, res)(
    () => challengeModel.submitChallenge(req.params.challengeId, req.body),
    () => res.status(201).send(),
  );
}

exports.list = (req, res) => {
  let perPage = req.query.perpage ? req.query.perpage : 15;
  let page = req.query.page ? req.query.page : 0;

  controller_run(req, res)(
    () => challengeModel.list(perPage, page),
    (result) => res.status(200).send(result),
  );
}
