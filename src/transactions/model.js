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
  challenge: {type: Schema.Types.ObjectId, ref: 'challenge'},
  referralCode: {type: Schema.Types.ObjectId, ref: 'referralCode'},
  reason: String, // short explanation description
}, {timestamps: true});
const Transaction = mongoose.model('transaction', transactionSchema);

const referralCodeSchema = new Schema({
  code: String, // code as it is seen in Shopify
  percentage: Number, // 0 - 100 value of percentage of sale
  owner: { type: Schema.Types.ObjectId, ref: 'user' },
}, {timestamps: true});
const ReferralCode = mongoose.model('referralCode', referralCodeSchema);

const referralCodeUsageSchema = new Schema({
  code: {type: Schema.Types.ObjectId, ref: 'referralCode'},
  total: Number,
  userName: String,
}, {timestamps: true});
const ReferralCodeUsage = mongoose.model('codeUsage', referralCodeUsageSchema);

const userBalanceSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'user' },
  balance: Number
}, {timestamps: true},
)
const UserBalance = mongoose.model('userBalance', userBalanceSchema);


/* ------------------- Model Functions ------------------  */

exports.createTransaction = (transactionData) => {
  const transaction = new Transaction(transactionData);
  return transaction.save();
}

exports.createReferralCode = (referralCodeData) => {
  const referralCode = new referralCode(referralCodeData);
  return referralCode.save();
}

exports.createReferralCodeUsage = (referralCodeUsageData) => {
  const referralCodeUsage = new ReferralCodeUsage(referralCodeUsageData);
  return referralCodeUsage.save();
}

exports.setUserBalance = (userId, newBalance) => 
  UserBalance.find({user: userId}).then(result => {
    if(result) {
      return UserBalance.findOneAndUpdate(
        {user: userId}, {balance: newBalance}, {upsert: true}
      )
    } else {
      let created = UserBalance({user: userId, balance: newBalance});
      return created.save();
    }
  })
