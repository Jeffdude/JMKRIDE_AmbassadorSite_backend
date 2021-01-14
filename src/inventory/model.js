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
const CompleteSet = mongoose.model('completeSet', completeSetSchema);

const logSchema = new Schema({
  actor: {type: Schema.Types.ObjectId, ref: 'user'},
  action: {type: String, enum: partConstants.inventoryActions},
  partId: {type: Schema.Types.ObjectId, ref: 'part'},
  amount: Number,
  reversed: {type: Boolean, default: false},
}, {timestamps: true});
const Log = mongoose.model('log', logSchema);


/* ------------------  Inventory Model Definitions ------------------  */

exports.createPart = (partData) => {
  const part = new Part(partData);
  return part.save();
};

exports.updatePartQuantity = ({ partId, quantity }) => {
  return Part.findOneAndUpdate({
    _id: partId,
  }, {$inc: {'quantity': quantity}});
};

exports.createLog = ({ actor, action, partId, amount }) => {
  const log = new Log({
    actor: actor,
    action: action,
    partId: partId,
    amount: amount,
    reversed: false,
  });
  return log.save();
}
