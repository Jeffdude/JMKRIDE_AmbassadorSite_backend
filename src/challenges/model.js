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

const challengeSubmissionSchema = new Schema({
  author: {type: Schema.Types.ObjectId, ref: 'Users'},
  content: [{type: Schema.Types.ObjectId, ref: 'challengeFormField'}],
})

const ChallengeSubmission = mongoose.model(
  'challengeSubmission',
  challengeSubmissionSchema,
);

const challengeFormFieldSchema = new Schema({
  title: String,
  fieldType: String,
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
