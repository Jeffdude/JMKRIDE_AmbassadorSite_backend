const { controller_run } = require('../modules/templates.js');
const locationLib = require('./lib.js');
const locationModel = require('./model.js');
const userModel = require('../users/model.js');

exports.lookupLocation = (req, res) =>
  controller_run(req, res)(
    () => locationLib.lookupLocation({
      country: req.body.country,
      zip: req.body.zip,
      extraStrings: req.body.extraStrings,
    }),
    (result) => res.status(200).send({result})
  );

exports.createLocationAndAddToUser = (req, res) =>
  controller_run(req, res)(
    () => locationModel.createLocation({
      country: req.body.country,
      zip: req.body.zip,
      lat: req.body.lat,
      lng: req.body.lng,
    }).then(result => userModel.patchUser(
      req.jwt.userId,
      {location: result._id}
    )),
    (result) => res.status(201).send({result})
  );