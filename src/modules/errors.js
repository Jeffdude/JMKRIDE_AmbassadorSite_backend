exports.sendAndPrintErrorFn = (res) => (error) => {
  console.log("[!] Caught error:", error);
  res.status(500).send({errors: err});
}

exports.printErrorFn = (res) => (error) => {
  console.log("[!] Caught error:", error);
  res.status(500).send();
}

exports.sendAndPrintError = (error, res) => {
  console.log("[!] Caught error:", error);
  res.status(500).send({errors: err});
}

exports.sendAndPrintError = (error, res) => {
  console.log("[!] Caught error:", error);
  res.status(500).send();
}
