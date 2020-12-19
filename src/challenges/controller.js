const challengeModel = require('./model.js');
const challengeConstants = require('./constants.js');

const { controller_run } = require('../modules/templates.js');

const { sendAndPrintErrorFn } = require('../modules/errors.js');


exports.create = (req, res) => {
  controller_run(req, res)(
    () => challengeModel.createChallenge({
      ...req.body,
      creator: req.jwt.userId,
    }),
    (result) => res.status(201).send({id: result._id}),
  );
}

exports.getAmbassadorApplication = (req, res) => {
  controller_run(req, res)(
    challengeConstants.getAmbassadorApplication,
    (result) => res.status(200).send(JSON.stringify(result.id)),
  );
}

exports.getChallenge = (req, res) => {
  controller_run(req, res)(
    () => challengeModel.getChallenge({challengeId: req.params.challengeId}),
    (result) => res.status(200).send(result),
  );
}

exports.listChallenges = (req, res) => {
  let perPage = req.query.perpage ? req.query.perpage : 15;
  let page = req.query.page ? req.query.page : 0;

  controller_run(req, res)(
    () => challengeConstants.getAmbassadorApplication()
      .then(result =>
        challengeModel.listChallenges(perPage, page, {excludeChallenges: [result.id]})
      ),
    (result) => res.status(200).send(JSON.stringify(result)),
  );
}

exports.submitChallenge = (req, res) => {
  let content = []
  Object.keys(req.body).forEach(key => content.push({field: key, content: req.body[key]}))

  controller_run(req, res)(
    () => challengeModel.createSubmission({
      author: req.jwt.userId,
      challenge: req.params.challengeId,
      content: content,
      status: "SUBMITTED",
    }),
    () => res.status(201).send(),
  );
}

exports.getSubmission = (req, res) => {
  controller_run(req, res)(
    () => challengeModel.getSubmission(
      { 
        challengeId: req.params.challengeId,
        userId: req.jwt.userId,
      }
    ),
    (result) => res.status(200).send(JSON.stringify(result)),
  );
}

exports.listSubmissions = (req, res) => {
  let perPage = req.query.perpage ? req.query.perpage : 15;
  let page = req.query.page ? req.query.page : 0;

  controller_run(req, res)(
    () => challengeModel.listSubmissions(perPage, page),
    (result) => res.status(200).send(JSON.stringify(result)),
  );
}
