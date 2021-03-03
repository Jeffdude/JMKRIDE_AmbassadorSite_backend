const userModel = require('../users/model.js');
const transactionModel = require('./model.js');

const userConstants = require('../users/constants.js');
const config = require('../config.js');
const { logInfo } = require('../modules/errors.js');

const createTransactionAndRecalculateBalance = (transactionData) => {
  const transactionPromise = transactionModel.createTransaction(transactionData)
  // TODO this will break 
  // if any other source/destination type is used other than 'user'
  transactionPromise.then(() => {
    exports.calculateUserBalance(transactionData.source);
    exports.calculateUserBalance(transactionData.destination);
  });
  return transactionPromise;
}


exports.createAdminTransaction = async ({amount, user, reason}) => {
  const adminUser = await userConstants.getAdminUser();

  return createTransactionAndRecalculateBalance({
    sourceType: 'user',
    source: adminUser.id,
    destinationType: 'user',
    destination: user,
    amount: amount,
    reason: "Admin Transaction: " + reason,
  });
}

exports.createChallengeAwardTransaction = async ({to, challenge, submissionId}) => {

  const adminUser = await userConstants.getAdminUser();

  return createTransactionAndRecalculateBalance({
    sourceType: 'user',
    source: adminUser.id,
    destinationType: 'user',
    destination: to,
    amount: challenge.award,
    submission: submissionId,
    reason: "Submission Approval: " + submissionId.toString(),
  });
}

exports.createReferralCodeUsage = async ({code, total, orderNumber}) => {
  const adminUser = await userConstants.getAdminUser();
  const referralCode = (await transactionModel.getReferralCode({id: code}).exec())[0];

  const adjusted_usd = total * (referralCode.percent / 100);
  const points = adjusted_usd / config.usdPerAmbassadorPoint;

  logInfo(
    "[$] Referral Code (" + referralCode._id + ") Usage: $" + total 
    + " at " + referralCode.percent + "% / "  + config.usdPerAmbassadorPoint 
    + " = " + points + " points."
  );
  return createTransactionAndRecalculateBalance({
    sourceType: 'user',
    source: adminUser.id,
    destinationType: 'user',
    destination: referralCode.owner._id,
    amount: points,
    referralCode: referralCode,
    referralCodeOrderNumber: orderNumber,
    reason: "Referral Code Usage: '" + referralCode.code + "' on order #" + orderNumber,
  });
}

exports.calculateUserBalance = async (userId, debug = true) => {
  if(debug) {
    logInfo("[$] Calculating user balance for user " + userId.toString());
  }
  let in_transactions = await transactionModel.getTransactions({to: userId}).exec();
  let in_total = 0;
  in_transactions.forEach(transaction => in_total += transaction.amount)
  if(debug) {
    logInfo("[$] UserId (" + userId.toString() + ") input total: " + in_total);
  }

  let out_transactions = await transactionModel.getTransactions({from: userId}).exec();
  let out_total = 0;
  out_transactions.forEach(transaction => out_total += transaction.amount)
  if(debug) {
    logInfo("[$] UserId (" + userId.toString() + ") output total: " + out_total);
  }

  let total = in_total - out_total;
  if(debug) {
    logInfo("[$] UserId (" + userId.toString() + ") balance: " + total);
  }
  return userModel.patchUser(userId, {balance: total});
}
