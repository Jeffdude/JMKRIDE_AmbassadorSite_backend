const transactionModel = require('./model.js');

const userConstants = require('../users/constants.js');

exports.createChallengeAwardTransaction = async ({to, challenge}) => {

  const adminUser = await userConstants.getAdminUser();

  return transactionModel.createTransaction({
    sourceType: 'user',
    source: adminUser.id,
    destinationType: 'user',
    destination: to,
    amount: challenge.award,
    challenge: challenge._id,
    reason: "[CC] Challenge Completion: " + challenge._id.toString(),
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

  return transactionModel.createTransaction({
    sourceType: 'user',
    source: adminUser.id,
    destinationType: 'user',
    destination: to,
    amount: 0,
    code: codeUsage.code,
    reason: "[CU]Code Usage: " + codeUsage._id.toString(),
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
  let out_total;
  out_transactions.forEach(transaction => out_total += transaction.amount)
  if(debug) {
    console.log("[$] UserId (" + userId.toString() + ") output total: " + out_total);
  }

  let total = in_total - out_total;
  if(debug) {
    console.log("[$] UserId (" + userId.toString() + ") balance: " + total);
  }

  return transactionModel.setUserBalance(userId, total);
}
