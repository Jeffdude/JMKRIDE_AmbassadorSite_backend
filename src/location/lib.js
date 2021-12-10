const { googleMapsApiKey } = require('../environment.js');
const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});

exports.lookupLocation = async ({country, zip, extraStrings}) => {
  return client.geocode({params: {
    key: googleMapsApiKey,
    address: country + " zip code " + zip + (extraStrings ? (" " + extraStrings) : "")
  }}).then(result => result.data.results.map(l => ({country, zip, ...l.geometry.location})))
};
