const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;


/* ------------------- Model Definitions ------------------  */


const bankInfoSchema = new Schema({
  owner: {type: Schema.Types.ObjectId, ref: 'user'},
});
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
  destinationType: { type: String, enum: transactionSubjects },
  destination: Schema.Types.ObjectId,
  amount: Number,
  submission: {type: Schema.Types.ObjectId, ref: 'challengeSubmission'},
  referralCode: {type: Schema.Types.ObjectId, ref: 'referralCode'},
  reason: String, // short explanation description
}, {timestamps: true});
const Transaction = mongoose.model('transaction', transactionSchema);

const referralCodeSchema = new Schema({
  code: String, // code as it is seen in Shopify
  percent: Number, // 0 - 100 value of percentage of sale
  owner: { type: Schema.Types.ObjectId, ref: 'user' },
}, {timestamps: true});
referralCodeSchema.virtual('usageCount', {
  ref: 'referralCodeUsage',
  localField: '_id',
  foreignField: 'code',
  count: true,
}, {timestamps: true});
referralCodeSchema.set('toJSON', {virtuals: true})
const ReferralCode = mongoose.model('referralCode', referralCodeSchema);

const referralCodeUsageSchema = new Schema({
  code: {type: Schema.Types.ObjectId, ref: 'referralCode'},
  total: Number,
  userName: String,
}, {timestamps: true});
const ReferralCodeUsage = mongoose.model('referralCodeUsage', referralCodeUsageSchema);


/* ------------------- Model Functions ------------------  */

exports.createTransaction = (transactionData) => {
  const transaction = new Transaction(transactionData);
  return transaction.save();
}

exports.createReferralCode = (referralCodeData) => {
  const referralCode = new ReferralCode(referralCodeData);
  return referralCode.save();
}

exports.getReferralCode = ({userId}) =>
  ReferralCode.find(userId ? {owner: userId} : {}).populate("owner").populate("usageCount");

exports.createReferralCodeUsage = (referralCodeUsageData) => {
  const referralCodeUsage = new ReferralCodeUsage(referralCodeUsageData);
  return referralCodeUsage.save();
}

exports.getTransactions = ({any, to, from}) => {
  if(any){
    return Transaction.find().or([{destination: any}, {source: any}])
  } else if(to){
    return Transaction.find({destination: to});
  } else if (from){
    return Transaction.find({source: from})
  } 
  throw new Error("[getTransactions] One of 'any', 'to', or 'from' required.");
}

exports.getTransactionBySubmissionId = (submissionId) =>
  Transaction.find({submission: submissionId});
