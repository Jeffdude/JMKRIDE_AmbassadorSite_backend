const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;


/* ------------------- Model Definitions ------------------  */

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
  destination: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'sourceType',
  },
  amount: Number,
  submission: {type: Schema.Types.ObjectId, ref: 'challengeSubmission'},
  referralCode: {type: Schema.Types.ObjectId, ref: 'referralCode'},
  referralCodeOrderNumber: Number,
  referralCodeUsage: {type: Schema.Types.ObjectId, ref: 'referralCodeUsage'},
  reason: String, // short explanation description
}, {timestamps: true});
const Transaction = mongoose.model('transaction', transactionSchema);

const referralCodeSchema = new Schema({
  code: String, // code as it is seen in Shopify
  percent: Number, // 0 - 100 value of percentage of sale
  owner: { type: Schema.Types.ObjectId, ref: 'user' },
}, {timestamps: true});
referralCodeSchema.virtual('usageCount', {
  ref: 'transaction',
  localField: '_id',
  foreignField: 'referralCode',
  count: true,
}, {timestamps: true});
referralCodeSchema.set('toJSON', {virtuals: true})
referralCodeSchema.set('toObject', {virtuals: true});
const ReferralCode = mongoose.model('referralCode', referralCodeSchema);


/* ------------------- Model Functions ------------------  */

exports.createTransaction = (transactionData) => {
  const transaction = new Transaction(transactionData);
  return transaction.save();
}

exports.createReferralCode = (referralCodeData) => {
  const referralCode = new ReferralCode(referralCodeData);
  return referralCode.save();
}

exports.getReferralCode = ({_id, owner, code, populate = true}) => {
  const query = ReferralCode.find({
    ..._id ? {_id} : {},
    ...owner ? {owner} : {},
    ...code ? {code} : {},
  })
  return populate 
    ? query.populate("owner usageCount")
    : query;
}

exports.getTransactions = ({
    eitherSubject,
    destination,
    source,
    submissionId,
    transactionId,
    referralCodeId,
    referralCodeOrderNumber,
    populate = true,
}) => {
  let params = {};
  if(eitherSubject) params.$or = [{destination: eitherSubject}, {source: eitherSubject}]
  if(destination) params.destination = destination;
  if(source) params.source = source;
  if(submissionId) params.submission = submissionId;
  if(referralCodeId) params.referralCode = referralCodeId;
  if(transactionId) params._id = transactionId;
  if(referralCodeOrderNumber) params.referralCodeOrderNumber = referralCodeOrderNumber;
  const query = Transaction.find(params).sort({createdAt: -1});
  return populate 
    ? query.populate("source destination", "firstName lastName")
    : query;
}
