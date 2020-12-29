const challengeModel = require('./model.js');

exports.formatRequestContent = (content) => {
  let formatted_content = [];
  Object.keys(content).forEach(
    key => formatted_content.push({field: key, content: content[key]})
  )
  return formatted_content;
}

const hasSubmission = (challengeId, userId) => 
  challengeModel.getSubmissions({challengeId: challengeId, userId: userId})
    .then(res => {debugger; return res.length >= 1})

const canCreateSubmission = (challengeId, userId) => 
  challengeModel.getChallenge({challengeId: challengeId})
    .then(challenge => {
      if(!challenge.allowMultipleSubmissions){
        return hasSubmission(challengeId, userId)
          .then(res => !res)
      } else {
        return new Promise((resolve, reject) => resolve(true));
      }
    })

exports.createSubmission = ({userId, challengeId, content}) => {
  return new Promise((resolve, reject) => {
    canCreateSubmission(challengeId, userId)
      .then(allowed => {
        if(allowed) {
          resolve(challengeModel.createSubmission({
            userId: userId,
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
