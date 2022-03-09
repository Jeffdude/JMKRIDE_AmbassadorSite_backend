const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;


const locationSchema = new Schema({
  country: String,
  zip: String,
  lat: Number,
  lng: Number,
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true},
})
locationSchema.virtual('userQuantity', {
  ref: 'user',
  localField: '_id',
  foreignField: 'location',
  count: true,
});
const Location = mongoose.model('location', locationSchema);

const createLocation = (locationData) => {
  const location = new Location(locationData);
  return location.save();
}

exports.findOrCreateLocation = (locationData) =>
  Location.findOne(locationData).then(result =>
    result ? result : createLocation(locationData)
  )

exports.populateLocations = (locations) => 
  Location.populate(locations, {path: 'location'})