const {
  sendAndPrintErrorAndReqFn,
  sendAndPrintErrorAndReq
} = require('../modules/errors.js');

exports.controller_run = (req, res) => (modelFn, thenFn) => {
  try {
    modelFn().then(thenFn).catch(sendAndPrintErrorAndReqFn(res, req));
  } catch (err) {
    sendAndPrintErrorAndReq(res, req, err);
  }
}
