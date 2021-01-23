const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;


/* ------------------- Model Definitions ------------------  */


const FIELD_TYPES = [
  "NUMBER",                                 // Number
  "DATE",                                   // String - iso format
  "SWITCH",                                 // [String] - each selectable choice
  "LEGAL_CHECK",                            // Boolean - has been checked
  "YES_NO",                                 // Boolean - but displayed differently than check
  "EMAIL",                                  // String - with validation
  "TEXT_SHORT", "TEXT_MEDIUM", "TEXT_LONG", // String
];
const challengeFormFieldSchema = new Schema({
  title: String,
  fieldType: {type: String, enum: FIELD_TYPES},
});
const challengeSchema = new Schema({
  title: String,
  shortDescription: String,
  longDescription: String,
  award: Number,
  allowMultipleSubmissions: {type: Boolean, default: false},
  creator: {type: Schema.Types.ObjectId, ref: 'user'},
  structure: [challengeFormFieldSchema],
}, { timestamps: true });
const Challenge = mongoose.model('challenge', challengeSchema);


const challengeSubmissionFormFieldSchema = new Schema({
  field: {type: Schema.Types.ObjectId, ref: 'challengeFormField'},
  content: {type: Schema.Types.Mixed}
});
const SUBMISSION_STATUS = ["PENDING", "APPROVED", "DENIED"];
const challengeSubmissionSchema = new Schema({
  author: {type: Schema.Types.ObjectId, ref: 'user'},
  challenge: {type: Schema.Types.ObjectId, ref: 'challenge'},
  content: [challengeSubmissionFormFieldSchema],
  status: {type: String, enum: SUBMISSION_STATUS},
  note: String, // If rejected, why? If accepted, a "good job" or something
}, { timestamps: true });
const ChallengeSubmission = mongoose.model(
  'challengeSubmission',
  challengeSubmissionSchema,
);


/* ------------------- Model Functions ------------------  */

exports.createChallenge = (challengeData) => {
  const challenge = new Challenge(challengeData);
  return challenge.save();
}

exports.updateChallengeById = (id, challengeData) => {
  return Challenge.findOneAndUpdate(
    {_id: id},
    challengeData,
    {new: true},
  );
}

/*
 * getChallengeFields - returns valid challenge field types
 * - for use by the admin-only challenge creation tool
 */
exports.getChallengeFields = () => FIELD_TYPES;

exports.deleteChallengeById = (id) => Challenge.deleteOne({_id: id});

exports.getChallenge = ({ challengeId, submissionId }) => {
  if (challengeId) {
    return Challenge.findById(challengeId);
  } else if (submissionId) {
    return ChallengeSubmission.findById(submissionId)
      .then(submission => Challenge.findById(submission.challenge))
  }
  throw new Error("[getChallenge] Invalid Arguments:", challengeId, submissionId);
}

exports.createSubmission = (challengeSubmissionData) => {
  const submission = new ChallengeSubmission(challengeSubmissionData);
  return submission.save();
}

exports.getSubmissions = ({ submissionId, challengeId, userId }) => {
  if (submissionId) {
    return ChallengeSubmission.findById(submissionId)
  } else if (challengeId && userId) {
    return ChallengeSubmission.find({
      author: userId,
      challenge: challengeId,
    })
  }
  throw new Error("[getSubmissions] Invalid Arguments:", challengeId, submissionId);
}


exports.listChallenges = (perPage, page, { excludeChallenges = [] }) => {
  return new Promise((resolve, reject) => {
    Challenge.find({_id: {$nin: excludeChallenges}})
      .limit(perPage)
      .skip(perPage * page)
      .exec(function (err, challenges) {
        if (err) {
          reject(err);
        } else {
          resolve(challenges);
        }
      })
  })
}

exports.listSubmissions = (perPage, page, { excludeSubmissions = [] }) => {
  return new Promise((resolve, reject) => {
    ChallengeSubmission.find({_id: {$nin: excludeSubmissions}})
      .limit(perPage)
      .skip(perPage * page)
      .exec(function (err, challenges) {
        if (err) {
          reject(err);
        } else {
          resolve(challenges);
        }
      })
  })
}

/*
 * updateSubmission
 *  - Admin only for changing the status and note of submissions
 */
exports.updateSubmission = ({submissionId, status, note }) => 
  ChallengeSubmission.findOneAndUpdate(
    {_id: submissionId}, 
    {status: status, note: note},
    {returnOriginal: false},
  );
