const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;

const partConstants = require('./constants.js')


/* ------------------  Inventory Model Definitions ------------------  */

  
const categorySchema = new Schema({
  name: String,
})
const Category = mongoose.model('category', categorySchema)

const inventorySchema = new Schema({
  name: String,
})
const Inventory = mongoose.model('inventory', inventorySchema);

/* 
 * partSchema
 *  - quantityMap: {Inventory.name [String]: Quantity [Number]}
 */
const partSchema = new Schema({
  name: String,
  color: {type: String, enum: partConstants.PART_COLORS},
  type: {type: Schema.Types.ObjectId, ref: 'category'},
  creator: {type: Schema.Types.ObjectId, ref: 'user'},
  quantityMap: {type: Map, of: Number},
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
  action: {type: String, enum: Object.values(partConstants.inventoryActions)},
  partId: {type: Schema.Types.ObjectId, ref: 'part'},
  inventoryId: {type: Schema.Types.ObjectId, ref: 'inventory'},
  amount: Number,
  reversed: {type: Boolean, default: false},
}, {timestamps: true});
const Log = mongoose.model('log', logSchema);


/* ------------------  Inventory Model Definitions ------------------  */

exports.createPart = (partData) => {
  const part = new Part(partData);
  return part.save();
};

exports.patchPart = (id, partData) => 
  Part.findOneAndUpdate({
    _id: id
  }, partData);

exports.createCategory = (categoryData) => {
  const category = new Category(categoryData);
  return category.save();
};

exports.createInventory = (inventoryData) => {
  const inventory = new Inventory(inventoryData);
  return inventory.save();
};

exports.updatePartQuantity = async ({ inventoryId, partId, quantity }) => {
  const session = mongoose.startSession();
  await session.withTransaction(async () => {
    const part = Part.findById(partId).session(session);
    const inventory = Inventory.findById(inventoryId).session(session);
    part.quantityMap[inventory.name] = part.quantityMap[inventory.name] + quantity;
    await part.save();
  });
  session.endSession();
};

exports.createCompleteSet = (completeSetData) => {
  const completeset = new CompleteSet(completeSetData);
  completeset.enabled = true;
  return completeset.save();
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
