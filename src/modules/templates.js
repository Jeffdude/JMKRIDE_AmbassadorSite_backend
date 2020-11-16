const {
  sendAndPrintErrorFn,
  sendAndPrintError
} = require('../modules/errors.js');

exports.controller_run = (req, res) => (modelFn, thenFn) => {
  try {
    modelFn().then(thenFn).catch(sendAndPrintErrorFn(res));
  } catch (err) {
    sendAndPrintError(err, res);
  }
}
