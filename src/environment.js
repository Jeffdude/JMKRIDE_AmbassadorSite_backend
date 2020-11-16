let operationMode = process.env.NODE_ENV;
if (![
    "production",
    "development",
    "unittest",
  ].contains(operationMode)
){
  console.log("[!] Invalid NODE_ENV Environment Variable. Defaulting to \"development\".");
  operationMode = "development";
}
module.exports.operationMode = operationMode;
