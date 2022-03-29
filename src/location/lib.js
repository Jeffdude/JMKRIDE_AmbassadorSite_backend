const { googleMapsServerApiKey } = require('../environment.js');
const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});

const isValidBoundingBox = (bounds) => {
  const height = Math.abs(bounds.northeast.lat - bounds.southwest.lat)
  const width = Math.abs(bounds.northeast.lng - bounds.southwest.lng)
  return height > 0.03 && width > 0.03
}

const boundsExceptionCountries = ['Singapore']

exports.lookupLocation = async ({country, zip, extraStrings}) => {
  return client.geocode({params: {
    key: googleMapsServerApiKey,
    address: country + " zip code " + zip + (extraStrings ? (" " + extraStrings) : "")
  }}).then(googleResult => {
    if(googleResult.data.results.length){
      const result = googleResult.data.results.find(obj => obj.types.includes('postal_code'));
      if(!result) return {error: 'No results Found'}

      const { long_name: country } = result.address_components.find(({types}) => types.includes('country'))
      if(!country) return {error: 'No results Found'}

      if(!result.geometry.bounds && !boundsExceptionCountries.includes(country)) return {error: 'Defined Area Is Too Specific'}

      if(result.geometry.bounds && !isValidBoundingBox(result.geometry.bounds)) return {error: 'Defined Area Is Too Specific'}

      return ({
        country,
        zip,
        bounds: result.geometry.bounds,
        formatted_address: result.formatted_address,
        ...result.geometry.location
      })
    }
    return {error: 'No Results Found'};
  });
};
