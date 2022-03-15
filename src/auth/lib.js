const crypto = require('crypto');

const emailModule = require('../modules/email.js');
const userModel = require('../users/model.js');
const userLib = require('../users/lib.js');
const authModel = require('./model.js');
const { TOKEN_TYPE } = require('./constants.js');

const { logInfo, logError } = require('../modules/errors.js');

const tokenIsValid = (token, tokenType) => {
  if(token.expiration < Date.now()) {
    logError("[!][tokenIsValid] Token Expired");
    return false;
  }
  if(token.type !== tokenType) {
    logError(
      "[!][tokenIsValid] Token Type Invalid: "
      + token.type + " vs. " + tokenType
    );
    return false;
  }
  return true;
}

const validateToken = (tokenType) => (token) => {
  if(!token) return false;
  if(tokenIsValid(token, tokenType)) return token;
  return false;
}

const validatePassword = (userId, password) =>
  userModel.findById(userId).then(user => {
    if(!user){
      logError("[!][validatePassword] Failed to find user.");
      return false
    } 
    let passwordFields = user.password.split('$');
    let salt = passwordFields[0];
    let hash = crypto.createHmac('sha512', salt).update(password).digest("base64");
    if (hash === passwordFields[1]) {
      return true;
    } else {
      logError(
        "[!][validatePassword] Hash and PW didn't match:",
        password,
        hash,
        "[redacted]",
      );
      return false;
    }
  })
     

exports.resetPasswordAdmin = ({userId, newPassword}) =>
  userLib.updatePassword(userId, newPassword);

exports.resetPasswordWithPassword = ({userId, oldPassword, newPassword}) => 
  validatePassword(userId, oldPassword).then(
    valid => {
      if(valid && newPassword) {
        logInfo("[-][resetPasswordWithPassword] Success. Updating password.");
        return userLib.updatePassword(
          userId,
          newPassword,
        )
      } else {
        throw new Error("[!][resetPasswordWithPassword] Incorrect Password");
      }
    }
  );


exports.resetPasswordWithToken = ({tokenKey, newPassword}) => 
  authModel.findTokenByKey(tokenKey).then(validateToken(TOKEN_TYPE.passwordReset)).then(token => {
    if(!token){
      throw new Error("[!][resetPasswordWithToken] Invalid Token. Failing")
    } else {
      userLib.updatePassword(token.owner._id, newPassword)
      .then(() => authModel.deleteToken({_id: token._id}))
    }
  })

exports.verifyEmailToken = async (tokenKey, userId) => {
  const token = await authModel.findTokenByKey(tokenKey);
  if(token && tokenIsValid(token, TOKEN_TYPE.emailVerification)) {
    if(token.owner.toString() === userId) {
      return userModel.patchUser(userId, {emailVerified: true})
        .then(authModel.deleteToken({id: token._id}))
    } else {
      throw new Error(
        "[!][verifyEmailToken] Token owner does not match" + 
        token.owner + " vs. " + userId
      )
    }
  } else {
    throw new Error("[!][verifyEmailToken] Token is missing or invalid")
  }
}

const createToken = ({tokenType, userId}) => 
  authModel.createToken({
    owner: userId,
    expiration: new Date(new Date().getTime()+(4*24*3600*1000)), // four days time
    key: crypto.randomBytes(50).toString('hex'),
    type: tokenType,
  })

exports.createPasswordResetToken = ({userId}) => createToken({userId, tokenType: TOKEN_TYPE.passwordReset})

exports.createAndSendEmailVerificationToken = async ({userId}) => {
  const user = await userModel.findById(userId, {populateEmailVerificationToken: true});
  createToken({userId, tokenType: TOKEN_TYPE.emailVerification}).then(
    token => emailModule.sendEmailVerificationEmail(
      {email: user.email, tokenKey: token.key}
    )
  );
}
