const crypto = require('crypto');

const userModel = require('./model.js');
const userLib = require('./lib.js');
const userConstants = require('./constants.js');
const challengeModel = require('../challenges/model.js');
const { permissionValues } = require('../constants.js');
const { processMode } = require('../environment.js');

const { controller_run } = require('../modules/templates.js');
const {
  sendAndPrintErrorFn,
  sendAndPrintError
} = require('../modules/errors.js');

class BaseUserController {
  static insert(req, res){
    return controller_run(req, res)(
      () => userModel.findByEmail(req.body.email).then(
        result => {
          if(result && result.length) {
            throw new Error("A user with that email already exists.")
          }
          return userLib.createUser({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
          });
        }
      ),
      (result) => res.status(201).send({id: result._id}),
    )
  }

  static lookup({version}) { return (req, res) => {
    res.status(200).send(version < 2 ? {id: req.jwt.userId} : {result: {id: req.jwt.userId}});
  }}

  static list({version}){ return (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 50;
    let page = 0;
    if (req.query) {
      if (req.query.page) {
        req.query.page = parseInt(req.query.page);
        page = Number.isInteger(req.query.page) ? req.query.page : 0;
      }
    }
    userModel.list(limit, page)
      .then((result) => {
        if(version < 2) {
          return res.status(200).send(result);
        } 
        return res.status(200).send({result});
      })
  }}

  static getById({version}){ 
    return (req, res) => 
      controller_run(req, res)(
        () => userModel.findById(req.params.userId).then((result) => {
          if(!result) return;
          let resultObject = result.toObject();
          resultObject.permissionLevel = permissionValues[result.permissionLevel];
          delete(resultObject.password);
          delete(resultObject.__v);
          return resultObject;
        }),
        (result) => {
          if(version < 2) {
            return res.status(200).send(result);
          }
          return res.status(200).send({result});
        },
      );
  }

  static patchById(req, res){
    if (req.body.password) {
      let salt = crypto.randomBytes(16).toString('base64');
      let hash = crypto.createHmac('sha512', salt)
        .update(req.body.password)
        .digest("base64");
      req.body.password = salt + "$" + hash;
    }
    userModel.patchUser(req.params.userId, req.body)
      .then(() => {
        res.status(201).send({result: "success"});
      });
  }

  static setUserSettings(req, res){
    return controller_run(req, res)(
      () => userModel.setUserSettings(
        req.params.userId,
        req.body,
      ),
      (result) => res.status(201).send({result}),
    );
  }

  static removeById(req, res){
    userModel.removeById(req.params.userId)
      .then(()=>{
        res.status(202).send({});
      });
  }
}

class AmbassadorsiteUserController extends BaseUserController {
  static getSubmissionCountById(req, res) {
    return controller_run(req, res)(
      () => challengeModel.getSubmissionCount(req.params.userId),
      (result) => res.status(200).send({count: result}),
    );
  }

  static getById({version}) { 
    return (req, res) =>
      controller_run(req, res)(
        () => userModel.findById(
          req.params.userId,
          {
            populateSubmissionCount: false,
            populateReferralCode: true,
            populateLocation: true,
          }
        ).then((result) => {
          if(!result) return;
          let resultObject = result.toObject();
          resultObject.permissionLevel = permissionValues[result.permissionLevel];
          delete(resultObject.password);
          delete(resultObject.__v);
          return resultObject;
        }),
        (result) => {
          if(version < 2) {
            return res.status(200).send(result);
          }
          return res.status(200).send({result});
        },
      );
  }
}

class StocktrackerUserController extends BaseUserController {
  static insert(req, res){
    try {
      userLib.createUser({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        settings: userConstants.defaultStocktrackerUserSettings,
      })
        .then(result => {
          return res.status(201).send({id: result._id});
        })
        .catch(sendAndPrintErrorFn(res))
    } catch(error) {
      sendAndPrintError(res, error);
    }
  }
  static setDefaultInventory(req, res) {
    return controller_run(req, res)(
      () => userModel.patchUser(
        req.jwt.userId,
        { defaultInventory: req.params.inventoryId }
      )
    )
  }
  static setDefaultCategorySet(req, res) {
    return controller_run(req, res)(
      () => userModel.patchUser(
        req.jwt.userId,
        { defaultCategorySet: req.params.categorySetId }
      )
    )
  }
  static setDefaultCSSet(req, res) {
    return controller_run(req, res)(
      () => userModel.patchUser(
        req.jwt.userId,
        { defaultCSSet: req.params.CSSetId },
      )
    )
  }
}

module.exports = {
  ambassadorsite: AmbassadorsiteUserController,
  stocktracker: StocktrackerUserController,
}[processMode];
