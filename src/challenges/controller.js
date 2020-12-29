const challengeModel = require('./model.js');
const challengeLib = require('./lib.js');
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
  controller_run(req, res)(
    () => challengeLib.createSubmission({
      userId: req.jwt.userId,
      challengeId: req.params.challengeId,
      content: challengeLib.formatRequestContent(req.body),
    }),
    () => res.status(201).send(),
  );
}

exports.getSubmissions = (req, res) => {
  controller_run(req, res)(
    () => challengeModel.getSubmissions(
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
