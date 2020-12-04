let operationMode = process.env.NODE_ENV;
if (!([
    "production",
    "development",
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

let AdminSecret = process.env.ADMIN_SECRET;
if(! AdminSecret) {
  console.log("[!] No Admin secret specified. Defaulting to DEVEL only value")
  AdminSecret = "pass"
}
module.exports.AdminSecret = AdminSecret;
