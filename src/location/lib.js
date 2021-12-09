const { googleMapsApiKey } = require('../environment.js');
const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});

exports.lookupLocation = ({country, zip, extraStrings}) => {
  return client.geocode({params: {
    key: googleMapsApiKey,
    address: country + " " + zip + (extraStrings ? (" " + extraStrings) : "")
  }})
};
