const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Types;

const locationConstants = require('./constants.js');


const locationSchema = new Schema({
  country: {type: String, enum: locationConstants.allCountries},
  zipcode: String,
  latitude: Number,
  longitude: Number,
})
const Location = mongoose.model('location', locationSchema);