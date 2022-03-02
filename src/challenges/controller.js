const challengeModel = require('./model.js');
const challengeLib = require('./lib.js');
const challengeConstants = require('./constants.js');

const { controller_run } = require('../modules/templates.js');
const { permissionLevels } = require('../constants.js');
const { logError } = require('../modules/errors.js');


exports.getChallengeFields = (req, res) => {
  controller_run(req, res)(
    challengeModel.getChallengeFields,
    (result) => res.status(200).send(result)
  );
}

exports.createChallenge = (req, res) => {
  controller_run(req, res)(
    () => challengeModel.createChallenge({
      ...req.body,
      creator: req.jwt.userId,
    }),
    (result) => res.status(201).send({id: result._id}),
  );
}

exports.getChallenge = (req, res) =>
  controller_run(req, res)(
    () => challengeModel.getChallenge({
      challengeId: req.params.challengeId,
      populateSubmissions: true, userId: req.jwt.userId
    }),
    (result) => res.status(200).send({ result }),
  );

exports.getAmbassadorApplication = (req, res) =>
  controller_run(req, res)(
    () => challengeConstants.getAmbassadorApplication()
      .then(({ id : challengeId }) => challengeModel.getChallenge({
        challengeId, populateSubmissions: true, userId: req.jwt.userId
      })),
    (result) => res.status(200).send({result})
  )

exports.getAllChallenges = (req, res) => {
  let perPage = req.query.perpage ? Number(req.query.perpage) : 50;
  let page = req.query.page ? Number(req.query.page) : 0;

  return controller_run(req, res)(
    () => challengeModel.listChallenges(perPage, page),
    (result) => res.status(200).send({ result }),
  );
}

exports.submitChallenge = (req, res) => {
  controller_run(req, res)(
    () => challengeLib.createSubmission({
      userId: req.jwt.userId,
      challengeId: req.params.challengeId,
      content: challengeLib.formatRequestContent(req.body),
    }),
    (submission) => res.status(201).send({result: submission._id}),
  );
}

exports.submissionAllowed = (req, res) => {
  controller_run(req, res)(
    () => challengeLib.submissionsAllowed({
      userId: req.jwt.userId,
      challengeId: req.params.challengeId,
    }),
    (result) => res.status(200).send(result),
  );
}

exports.getAllSubmissions = (req, res) => 
  controller_run(req, res)(
    () => challengeModel.getSubmissions({
      all: true,
      populateAuthor: true,
      populateChallenge: true,
    }),
    (result) => res.status(200).send({result}),
  );

exports.getSubmission = (req, res) => 
  controller_run(req, res)(
    () => challengeModel.getSubmissionById(req.params.submissionId, {
      populateAuthor: true,
      populateChallenge: true,
    }),
    (result) => { 
      if(!(
        result.author._id.toString() === req.jwt.userId.toString() || req.jwt.permissionLevel == permissionLevels.ADMIN
      )){
        logError(
          "[!][403][challenges/controller][getSubmission] Failed: ",
          {result, userId: req.jwt.userId, permissionLevel: req.jwt.permissionLevel}
        );
        return res.status(403).send();
      }
      return res.status(200).send({result});
    },
  );

exports.listSubmissions = (req, res) => {
  let perPage = req.query.perpage ? req.query.perpage : 50;
  let page = req.query.page ? req.query.page : 0;

  controller_run(req, res)(
    () => challengeModel.listSubmissions(perPage, page),
    (result) => res.status(200).send(JSON.stringify(result)),
  );
}

exports.deleteSubmission = (req, res) =>
  controller_run(req, res)(
    () => challengeModel.getSubmissionById(req.params.submissionId).then(submission => {
      if(submission.author.toString() === req.jwt.userId.toString() || req.jwt.permissionLevel == permissionLevels.ADMIN){
        return challengeModel.deleteChallengeSubmissionById(req.params.submissionId)
      }
      return
    }),
    (result) => res.status(result ? 200 : 403).send({result: !!result}),
  );

exports.updateSubmission = (req, res) =>
  controller_run(req, res)(
    () => challengeLib.updateSubmission(
      {
        submissionId: req.params.submissionId,
        status: req.body.status,
        note: req.body.note,
      }
    ),
    () => res.status(200).send({result: true})
  );

exports.getPendingSubmissions = (req, res) => 
  controller_run(req, res)(
    () => challengeModel.getPendingSubmissions(),
    (result) => res.status(200).send({result}),
  );
