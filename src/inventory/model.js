const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;

const partConstants = require('./constants.js')


/* ------------------  Inventory Model Definitions ------------------  */

  
const partSchema = new Schema({
  name: String,
  color: {type: String, enum: partConstants.PART_COLORS},
  type: {type: String, enum: partConstants.PART_TYPES},
  creator: {type: Schema.Types.ObjectId, ref: 'user'},
  quantity: Number,
});
const Part = mongoose.model('part', partSchema);

const completeSetSchema = new Schema({
  name: String,
  enabled: Boolean,

  lwheel1: {type: Schema.Types.ObjectId, ref: 'part'},
  lwheel2: {type: Schema.Types.ObjectId, ref: 'part'},
  ltruck: {type: Schema.Types.ObjectId, ref: 'part'},
  ldeck: {type: Schema.Types.ObjectId, ref: 'part'},
  lgrip: {type: Schema.Types.ObjectId, ref: 'part'},

  rwheel1: {type: Schema.Types.ObjectId, ref: 'part'},
  rwheel2: {type: Schema.Types.ObjectId, ref: 'part'},
  rtruck: {type: Schema.Types.ObjectId, ref: 'part'},
  rdeck: {type: Schema.Types.ObjectId, ref: 'part'},
  rgrip: {type: Schema.Types.ObjectId, ref: 'part'},
});
const completeSet = mongoose.model('completeSet', completeSetSchema);


/* ------------------  Inventory Model Definitions ------------------  */

exports.createPart = (partData) => {
  const part = new Part(partData);
  return part.save();
};
