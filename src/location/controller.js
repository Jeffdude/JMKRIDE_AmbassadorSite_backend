const { controller_run } = require('../modules/templates.js');
const locationLib = require('./lib.js');
const locationModel = require('./model.js');
const userModel = require('../users/model.js');
const userConstants = require('../users/constants.js');
const friendModel = require('../friends/model.js');

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
    () => locationModel.findOrCreateLocation({
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

exports.getAllLocations = (req, res) => 
  controller_run(req,res)(
    () => friendModel.getPendingFriends({userId: req.jwt.userId}).then(
      pendingFriends => userConstants.getAdminUser().then(
        adminUser => userModel.getAllLocations({
          requesterUserId: req.jwt.userId,
          pendingFriends,
          adminUserId: adminUser.id,
        })
      )
    ),
    (result) => res.status(200).send({result}),
  )