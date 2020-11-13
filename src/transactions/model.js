const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;


/* ------------------- Model Definitions ------------------  */



const bankInfoSchema = new Schema({
  owner: {type: Schema.Types.ObjectId, ref: 'user'},
}
const bankInfo = mongoose.model(
  'bankInfo',
  bankInfoSchema,
);

/*
 * transactionSchema:
 *   transfer of (amount) exchange of ambassador points
 *   source -> destination
 *   whereby each subject's type is either JMKRIDE, the User's bank
 *   or a User. 
 *   source/destination can be of type: {
 *     'user'
 *     'referralCode'
 *     'challengeSubmission'
 *     'bankInfo'
 *   }
 */
const transactionSubjects = ['user', 'referralCode', 'challengeSubmission', 'bankInfo']
const transactionSchema = new Schema({
  sourceType: { 
    type: String,
    enum: transactionSubjects,
  }, 
  source: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'sourceType',
  },
  destinationType: { type: String, enum: transactionSubjects } 
  destinationId: Schema.Types.ObjectId,
  amount: Number,
});
const transaction = mongoose.model('transaction', transactionSchema);

const referralCodeSchema = new Schema({
  name: String,
  owner: { type: Schema.Types.ObjectId, ref: 'user' },
  transcations: [ { type: Schema.Types.ObjectId, ref: 'transaction' } ],
});
const referralCode = mongoose.model('referralCode', referralCodeSchema);

