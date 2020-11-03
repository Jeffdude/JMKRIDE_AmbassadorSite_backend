const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;


/* ------------------- Model Definitions ------------------  */

const challengeSchema = new Schema({
  title: String,
  shortDescription: String,
  longDescription: String,
  award: Number,
  completions: [{type: Schema.Types.ObjectId, ref: 'challengeSubmission'}],
  structure: [{type: Schema.Types.ObjectId, ref: 'challengeFormField'}],
});
const Challenge = mongoose.model('challenge', challengeSchema);


const SUBMISSION_STATUS = ["SUBMITTED", "APPROVED", "DENIED"];
const challengeSubmissionSchema = new Schema({
  author: {type: Schema.Types.ObjectId, ref: 'user'},
  content: [{type: Schema.Types.ObjectId, ref: 'challengeFormField'}],
  status: {type: String, enum: SUBMISSIONS_STATUS},
  note: String, // If rejected, why? If accepted, a "good job" or something
})
const ChallengeSubmission = mongoose.model(
  'challengeSubmission',
  challengeSubmissionSchema,
);

const FIELD_TYPES = [
  "NUMBER",                                 // Number
  "DATE",                                   // String - iso format
  "SWITCH",                                 // [String] - each selectable choice
  "LEGAL_CHECK",                            // Boolean - has been checked
  "TEXT_SHORT", "TEXT_MEDIUM", "TEXT_LONG", // String
];
const challengeFormFieldSchema = new Schema({
  title: String,
  fieldType: {type: String, enum: FIELD_TYPES},
  content: Schema.Types.Mixed,
});
const ChallengeFormField = mongoose.model(
  'challengeFormField',
  challengeFormFieldSchema,
);


/* ------------------- Model Functions ------------------  */

exports.findChallengeById = (id) => {
  return Challenge.findById(id)
    .then((result) => {
      result = result.toJSON();
      delete result._id;
      delete result.__v;
      return result;
    });
};

exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Challenge.find()
      .limit(perPage)
      .skip(perPage * page)
      .exec(function (err, challenges) {
        if (err) {
          reject(err);
        } else {
          resolve(challenges);
        }
      })
  });
}
