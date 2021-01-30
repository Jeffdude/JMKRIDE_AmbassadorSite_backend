const userModel = require('../users/model.js');
const transactionModel = require('./model.js');

const userConstants = require('../users/constants.js');

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

exports.createReferralCodeUsage = (
  {code, total, userName, note = "", createTransaction = true}
) => {
  let rc_promise = transactionModel.createReferralCodeUsage({
    code: code,
    total: total,
    userName: userName,
    note: note,
  });
  if (createTransaction) {
    return rc_promise.then(
      (codeUsage) => exports.createReferralCodeUseTransaction({
        to: code.owner,
        codeUsage: codeUsage._id,
      })
    );
  }
  return rc_promise;
}

exports.createReferralCodeUseTransaction = async ({to, codeUsage}) => {
  const adminUser = await userConstants.getAdminUser();

  return createTransactionAndRecalculateBalance({
    sourceType: 'user',
    source: adminUser.id,
    destinationType: 'user',
    destination: to,
    amount: 0,
    code: codeUsage.code,
    reason: "Code Usage: " + codeUsage._id.toString(),
  });
}

exports.calculateUserBalance = async (userId, debug = true) => {
  if(debug) {
    console.log("[$] Calculating user balance for user " + userId.toString());
  }
  let in_transactions = await transactionModel.getTransactions({to: userId}).exec();
  let in_total = 0;
  in_transactions.forEach(transaction => in_total += transaction.amount)
  if(debug) {
    console.log("[$] UserId (" + userId.toString() + ") input total: " + in_total);
  }

  let out_transactions = await transactionModel.getTransactions({from: userId}).exec();
  let out_total = 0;
  out_transactions.forEach(transaction => out_total += transaction.amount)
  if(debug) {
    console.log("[$] UserId (" + userId.toString() + ") output total: " + out_total);
  }

  let total = in_total - out_total;
  if(debug) {
    console.log("[$] UserId (" + userId.toString() + ") balance: " + total);
  }
  return userModel.patchUser(userId, {balance: total});
}

exports.getTransactions = ({userId, submissionId}) => {
  if(userId) {
    return transactionModel.getTransactions({any: userId});
  } else if(submissionId) {
    return transactionModel.getTransactionBySubmissionId(submissionId)
  }
  throw new Error("[getTransactions(lib) One of userId, submissionId required");
}
