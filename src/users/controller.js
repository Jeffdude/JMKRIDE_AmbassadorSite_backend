const crypto = require('crypto');

const userModel = require('./model.js');
const userLib = require('./lib.js');
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
    try {
      userLib.createUser({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      })
        .then(result => {
          return res.status(201).send({id: result._id});
        })
        .catch(sendAndPrintErrorFn(res))
    } catch(error) {
      sendAndPrintError(res, error);
    }
  }

  static lookup(req, res) {
    res.status(200).send({id: req.jwt.userId});
  }

  static list(req, res){
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
        res.status(200).send(result);
      })
  }

  static getById(req, res){
    userModel.findById(req.params.userId)
      .then((result) => {
        let resultObject = result.toObject();
        resultObject.permissionLevel = permissionValues[result.permissionLevel];
        delete(resultObject.password);
        delete(resultObject.__v);
        res.status(200).send(resultObject);
      });
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
        res.status(204).send({});
      });
  }

  static removeById(req, res){
    userModel.removeById(req.params.userId)
      .then(()=>{
        res.status(204).send({});
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

  static getById(req, res){
    userModel.findById(
      req.params.userId,
      {
        populateSubmissionCount: false,
        populateReferralCode: true,
      }
    )
      .then((result) => {
        let resultObject = result.toObject();
        resultObject.permissionLevel = permissionValues[result.permissionLevel];
        delete(resultObject.password);
        delete(resultObject.__v);
        res.status(200).send(resultObject);
      });
  }
}

class StocktrackerUserController extends BaseUserController {
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
}

module.exports = {
  ambassadorsite: AmbassadorsiteUserController,
  stocktracker: StocktrackerUserController,
}[processMode];
