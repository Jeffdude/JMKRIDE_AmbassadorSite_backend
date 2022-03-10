
const parseKeyValues = (input) => {
  let result = {}
  input.split(',').forEach(keyValue => {
    let [key, value] = keyValue.split('=');
    result[key] = value;
  })
  return result;
}


let port = process.env.PORT;
if (! port) {
  console.log("[!] No port specified. Defaulting to DEVEL only value")
  port = 3600
}
module.exports.port = port;

let processMode = process.env.FUNCTION;
if(![
    "ambassadorsite",
    "stocktracker",
  ].includes(processMode)){
  console.log(
    "[!] Invalid FUNCTION Environment Variable. Defaulting to \"ambassadorsite\"."
  );
  processMode = "ambassadorsite";
}
module.exports.processMode = processMode;


let operationMode = process.env.NODE_ENV;
if (!([
    "production",
    "development",
    "remotedevel",
    "unittest",
  ].includes(operationMode))
){
  console.log("[!] Invalid NODE_ENV Environment Variable. Defaulting to \"development\".");
  operationMode = "development";
}
module.exports.operationMode = operationMode;

let JWTSecret = process.env.JWT_SECRET;
if (! JWTSecret) {
  console.log("[!] No JWT secret specified. Defaulting to DEVEL only value")
  JWTSecret = "sup3rs3cr37pw!"
}
module.exports.JWTSecret = JWTSecret;

let adminSecret = process.env.ADMIN_SECRET;
if(! adminSecret) {
  console.log("[!] No Admin secret specified. Defaulting to DEVEL only value")
  adminSecret = "pass"
}
module.exports.adminSecret = adminSecret;

let mongoDBUser = process.env.MONGO_USER;
if (! mongoDBUser) {
  console.log("[!] No mongoDBUser specified. Defaulting to DEVEL only value")
  mongoDBUser = "mongoUser"
}
module.exports.mongoDBUser = mongoDBUser;

let mongoDBPassword = process.env.MONGO_PASS;
if (! mongoDBPassword) {
  console.log("[!] No mongoDBPassword specified. Defaulting to DEVEL only value")
  mongoDBPassword = "pass"
}
module.exports.mongoDBPassword = mongoDBPassword;

let emailAPIKey = process.env.EMAIL_PASS;
if (! emailAPIKey) {
  console.log("[!] No emailAPIKey specified. Defaulting to DEVEL only value")
  emailAPIKey = "pass"
}
module.exports.emailAPIKey = emailAPIKey;

let shopifyAppSecrets = process.env.SHOPIFY_APP_SECRETS ? parseKeyValues(process.env.SHOPIFY_APP_SECRETS) : undefined;
if (! shopifyAppSecrets) console.log("[!] No shopifyAppSecret specified. All shopifyAPI requests will be rejected.")
module.exports.shopifyAppSecrets = shopifyAppSecrets;

let googleMapsServerApiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || undefined;
if (! googleMapsServerApiKey) console.log("[!] No googleMapsServerApiKey specified.")
module.exports.googleMapsServerApiKey = googleMapsServerApiKey;

let googleMapsClientApiKey = process.env.GOOGLE_MAPS_CLIENT_API_KEY || undefined;
if (! googleMapsClientApiKey) console.log("[!] No googleMapsClientApiKey specified.")
module.exports.googleMapsClientApiKey = googleMapsClientApiKey;