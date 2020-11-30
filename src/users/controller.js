const UserModel = require('../users/model.js');
const crypto = require('crypto');

const {
  sendAndPrintErrorFn,
  sendAndPrintError
} = require('../modules/errors.js');

const PERMISSION_LEVELS = require('../config.js').permissionLevels;

exports.insert = (req, res) => {
  if( !(req.body.email && req.body.password)) {
    return res.status(400).send({error: "Missing email or password"});
  }

  let salt = crypto.randomBytes(16).toString('base64');
  let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
  req.body.password = salt + "$" + hash;
  req.body.permissionLevel = PERMISSION_LEVELS.USER;

  try {
    return UserModel.createUser(req.body).then((result) => {
      return res.status(201).send({id: result._id});
    }).catch(sendAndPrintErrorFn(res))
  } catch (err) {
    return sendAndPrintError(res, err);
  }
};

exports.lookup = (req, res) => {
  res.status(200).send({id: req.jwt.userId});
};

exports.list = (req, res) => {
  let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
  let page = 0;
  if (req.query) {
    if (req.query.page) {
      req.query.page = parseInt(req.query.page);
      page = Number.isInteger(req.query.page) ? req.query.page : 0;
    }
  }
  UserModel.list(limit, page)
    .then((result) => {
      res.status(200).send(result);
    })
};

exports.getSelf = (req, res) => {
  UserModel.findById(req.jwt.userId)
    .then((result) => {
      delete(result.password);
      res.status(200).send(result.toJSON());
    });
};

exports.getById = (req, res) => {
  UserModel.findById(req.params.userId)
    .then((result) => {
      let jsonResult = result.toJSON();
      delete(jsonResult.password);
      delete(jsonResult.__v);
      res.status(200).send(jsonResult);
    });
};
exports.patchById = (req, res) => {
  if (req.body.password) {
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
    req.body.password = salt + "$" + hash;
  }

  UserModel.patchUser(req.params.userId, req.body)
    .then(() => {
      res.status(204).send({});
    });

};

exports.removeById = (req, res) => {
  UserModel.removeById(req.params.userId)
    .then(()=>{
      res.status(204).send({});
    });
};
