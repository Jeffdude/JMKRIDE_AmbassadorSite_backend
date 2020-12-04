const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;


/* ------------------- Model Definitions ------------------  */


const constantModels = ['user', 'challenge'];

/*
 * A constant is a specific document of type {enum: constantModels}
 *  useful for any needed exceptional server state
 */
const constantSchema = new Schema({
  name: { // used for reference around the codebase
    type: String,
    required: true,
    unique: true,
  },
  id: {
    type: Schema.Types.ObjectId,
    refPath: 'type',
    required: true,
  },
  type: {
    type: String,
    enum: constantModels,
  },
});
const Constant = mongoose.model('constant', constantSchema);


/* ------------------- Model Functions ------------------  */

exports.createConstant = (constantData) => {
  const constant = new Constant(constantData);
  return constant.save();
}

exports.getByName = (name) => {
  return Constant.findOne(
    {name: name},
  );
}
