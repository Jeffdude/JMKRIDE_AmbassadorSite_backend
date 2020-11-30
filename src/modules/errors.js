/*
 * Fn postfixed functions should be used in .catch() blocks
 */
exports.sendAndPrintErrorFn = (res) => (error) => {
  console.log("[!] Caught error:", error);
  return res.status(500).send({errors: error});
}

exports.printErrorFn = (res) => (error) => {
  console.log("[!] Caught error:", error);
  return res.status(500).send();
}

/*
 * Non-Fn postfixed should be used in } catch (err) { blocks
 */
exports.sendAndPrintError = (res, error) => {
  console.log("[!] Caught error:", error);
  return res.status(500).send({errors: error});
}

exports.sendError = (res, error) => {
  console.log("[!] Caught error:", error);
  return res.status(500).send();
}
