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

exports.getReferralCode = ({id, userId, populate = true}) => {
  let query;
  if(id) {
    query = ReferralCode.find({_id: id});
  } else if (userId) {
    query = ReferralCode.find({owner: userId});
  } else {
    query = ReferralCode.find();
  }
  if(!populate) {
    return query
  }
  return query.populate("owner").populate("usageCount");
}

exports.getTransactions = (
  {any, to, from, submissionId, referralCodeId, populate = false}
) => {
  let query;
  if(any){
    query = Transaction.find().or([{destination: any}, {source: any}])
  } else if(to){
    query = Transaction.find({destination: to});
  } else if (from){
    query = Transaction.find({source: from})
  } else if (submissionId) {
    query = Transaction.find({submission: submissionId})
  } else if (referralCodeId) {
    query = Transaction.find({referralCode: referralCodeId})
  } else {
    query = Transaction.find()
  }
  if(populate){
    return query.populate("source").populate("destination");
  }
  return query;
}

exports.getAllReferralCodes = () => 
  ReferralCode.find().select('code')
