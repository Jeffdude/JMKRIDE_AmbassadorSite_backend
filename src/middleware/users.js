const crypto = require('crypto');

const { logError } = require('../modules/errors.js');
const UserModel = require('../users/model.js');


exports.hasAuthValidFields = (req, res, next) => {
  let errors = [];

  if (req.body) {
    if (!req.body.email) {
      errors.push('Missing email field');
    }
    if (!req.body.password) {
      errors.push('Missing password field');
    }

    if (errors.length) {
      logError("[!][400][hasAuthValidFields] Found errors in body:", errors, req.body);
      return res.status(400).send({errors: errors.join(',')});
    } else {
      return next();
    }
  } else {
    logError("[!][400][hasAuthValidFields] Found no body.");
    return res.status(400).send({errors: 'Missing email and password fields'});
  }
};

exports.passwordAndUserMatch = (req, res, next) => {
  UserModel.findByEmail(req.body.email)
    .then((user)=>{
      if(!user[0]){
        logError("[!][403][passwordAndUserMatch] Failed to find user with email: " + req.body.email);
        res.status(403).send({});
      }else{
        let passwordFields = user[0].password.split('$');
        let salt = passwordFields[0];
        let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
        if (hash === passwordFields[1]) {
          req.body = {
            userId: user[0]._id,
            email: user[0].email,
            permissionLevel: user[0].permissionLevel,
            provider: 'email',
            name: user[0].firstName + ' ' + user[0].lastName,
          };
          return next();
        } else {
          logError(
            "[!][403][passwordAndUserMatch] Hash and PW didn't match for user " + req.body.email + ":",
            req.body.password,
            hash,
            "[redacted]",
          );
          return res.status(403).send({errors: ['Invalid e-mail or password']});
        }
      }
    });
};
