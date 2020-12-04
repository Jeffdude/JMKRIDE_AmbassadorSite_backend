const operationMode = require('../environment.js').operationMode;
/*
 * Fn postfixed functions should be used in .catch() blocks
 */
exports.sendAndPrintErrorFn = (res) => (error) => {
  if(operationMode !== "unittest"){
    console.log("[!] Caught error:", error);
  }
  return res.status(500).send({error: error.message});
}

exports.printErrorFn = (res) => (error) => {
  if(operationMode !== "unittest"){
    console.log("[!] Caught error:", error);
  }
  return res.status(500).send();
}

/*
 * Non-Fn postfixed should be used in } catch (err) { blocks
 */
exports.sendAndPrintError = (res, error) => {
  if(operationMode !== "unittest"){
    console.log("[!] Caught error:", error);
  }
  return res.status(500).send({error: error.message});
}

exports.sendError = (res, error) => {
  if(operationMode !== "unittest"){
    console.log("[!] Caught error:", error);
  }
  return res.status(500).send();
}
