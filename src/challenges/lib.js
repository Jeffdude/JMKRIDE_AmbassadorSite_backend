const challengeModel = require('./model.js');

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
    challengeModel.getSubmissions({challengeId: challengeId, userId: userId})
      .then(res => res.length >= 1)

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
    exports.submissionsAllowed(challengeId, userId)
      .then(allowed => {
        if(allowed) {
          resolve(challengeModel.createSubmission({
            author: userId,
            challenge: challengeId,
            status: "SUBMITTED",
            content: content,
          }));
        } else {
          reject(new Error("Challenge already has submission"));
        }
      })
      .catch(error => reject(
        new Error("Error in canCreateSubmission:" + error.toString()))
      );
  });
}
