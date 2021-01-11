const crypto = require('crypto');

const userModel = require('./model.js');
const userLib = require('./lib.js');

const {
  sendAndPrintErrorFn,
  sendAndPrintError
} = require('../modules/errors.js');

exports.insert = (req, res) => {
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
  userModel.list(limit, page)
    .then((result) => {
      res.status(200).send(result);
    })
};

exports.getById = (req, res) => {
  userModel.findById(req.params.userId)
    .then((result) => {
      let resultObject = result.toObject();
      delete(resultObject.password);
      delete(resultObject.__v);
      res.status(200).send(resultObject);
    });
};
exports.patchById = (req, res) => {
  if (req.body.password) {
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
    req.body.password = salt + "$" + hash;
  }

  userModel.patchUser(req.params.userId, req.body)
    .then(() => {
      res.status(204).send({});
    });

};

exports.removeById = (req, res) => {
  userModel.removeById(req.params.userId)
    .then(()=>{
      res.status(204).send({});
    });
};
