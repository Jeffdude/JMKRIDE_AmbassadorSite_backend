const challengeModel = require('./model.js');
const challengeConstants = require('./constants.js');

const userLib = require('../users/lib.js');

const transactionLib = require('../transactions/lib.js');

/* 
 * Format ChallengeSubmissionContent from...
 *  {<fieldId>: <fieldContent>, ...}
 * to...
 *  [{field: <fieldId>, content: <fieldContent>},...]
 */
exports.formatRequestContent = (content) => {
  let formatted_content = [];
  Object.keys(content).forEach(
    key => formatted_content.push({field: key, content: content[key]})
  )
  return formatted_content;
}

exports.submissionsAllowed = async ({ challengeId, userId }) => {
  const hasSubmission = (challengeId, userId) => 
    challengeModel.userHasSubmittedChallenge({challengeId: challengeId, userId: userId})

  const challenge = await challengeModel.getChallenge({challengeId: challengeId})
  if(!challenge.allowMultipleSubmissions){
    return !(await hasSubmission(challengeId, userId));
  } else {
    return true
  }
}


/*
 * Create a new Submission
 *  if submissions not allowed for the challenge, throws an error
 */
exports.createSubmission = ({userId, challengeId, content}) => {
  return new Promise((resolve, reject) => {
    exports.submissionsAllowed({challengeId: challengeId, userId: userId})
      .then(allowed => {
        if(allowed) {
          resolve(challengeModel.createSubmission({
            author: userId,
            challenge: challengeId,
            status: "PENDING",
            content: content,
          }));
        } else {
          reject(new Error("Challenge already has submission"));
        }
      })
      .catch(error => reject(
        new Error("Error in submissionsAllowed:" + error.toString()))
      );
  });
}

/*
 * Update a submission
 *   - sets the submission's status
 *   - if status is approved:
   *   - if ambassador application
   *    -> updates the user's permissions + deletes all sessions
   *   - creates transaction for challenge's award
   * - if status is denied:
   *   - 
 */
exports.updateSubmission = ({submissionId, status, note}) => {

  const approveSubmission = async (submissionId) => {
    let submission = await challengeModel.getSubmissionById(submissionId);
    let challenge = await challengeModel.getChallenge({submissionId: submissionId});
    let ambassadorApplication = await challengeConstants.getAmbassadorApplication();
    if (challenge._id.toString() === ambassadorApplication.id.toString()) {
      await userLib.approveAmbassador(submission.author);
    }
    return transactionLib.createChallengeAwardTransaction(
      {to: submission.author, submissionId: submissionId, challenge: challenge}
    );
  }
  if(status === 'APPROVED') {
    return challengeModel.updateSubmission(
      {submissionId: submissionId, status: status, note: note}
    ).then(() => approveSubmission(submissionId))

  }
  return challengeModel.updateSubmission(
    {submissionId: submissionId, status: status, note: note}
  );
}
