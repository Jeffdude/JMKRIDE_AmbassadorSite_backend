const { controller_run } = require('../modules/templates.js');
const locationLib = require('./lib.js');

exports.lookupLocation = (req, res) =>
  controller_run(req, res)(
    () => locationLib.lookupLocation({
      country: req.body.country,
      zip: req.body.zip,
      extraStrings: req.body.extraStrings,
    }),
    (result) => res.status(201).send({result})
  )
