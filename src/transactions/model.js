const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;


/* ------------------- Model Definitions ------------------  */


/*
 * transactionSchema:
 *   transfer of (amount) exchange of ambassador points
 *   source -> destination
 *   whereby each subject's type is either JMKRIDE, the User's bank
 *   or a User. 
 *   type: USER => Id: 'Users'
 *   type: CODE => Id: 'referralCode'
 *   type: CHALLENGE => Id: 'challengeSubmission'
 *   type: USERSBANK => Id: TBD
 *
 */
const transactionSubjects = ['USER', 'CODE', 'CHALLENGE', 'USERSBANK']
const transactionSchema = new Schema({
  sourceType: { type: String, enum: transactionSubjects } 
  sourceId: Schema.Types.ObjectId,
  destinationType: { type: String, enum: transactionSubjects } 
  destinationId: Schema.Types.ObjectId,
  amount: Number,
});
const transaction = mongoose.model('transaction', transactionSchema);

const referralCodeSchema = new Schema({
  name: String,
  owner: { type: Schema.Types.ObjectId, ref: 'Users' },
  transcations: [ { type: Schema.Types.ObjectId, ref: 'transaction' } ],
});
const referralCode = mongoose.model('referralCode', referralCodeSchema);

