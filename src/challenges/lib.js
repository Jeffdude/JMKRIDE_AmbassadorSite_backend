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


/*
 * Create a new Submission
 *  if allowMultipleSubmissions is false for the challenge, throws and error
 */
exports.createSubmission = ({userId, challengeId, content}) => {

  const hasSubmission = (challengeId, userId) => 
    challengeModel.getSubmissions({challengeId: challengeId, userId: userId})
      .then(res => res.length >= 1)

  const canCreateSubmission = async (challengeId, userId) => {
    const challenge = await challengeModel.getChallenge({challengeId: challengeId})
    if(!challenge.allowMultipleSubmissions){
      return !(await hasSubmission(challengeId, userId));
    } else {
      return true
    }
  }

  return new Promise((resolve, reject) => {
    canCreateSubmission(challengeId, userId)
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
