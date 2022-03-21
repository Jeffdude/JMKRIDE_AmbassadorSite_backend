const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;

const { permissionLevels } = require('../constants.js');
const { processMode } = require('../environment.js');

const { socialLinkTypes } = require('./constants.js');


/* ------------------------- Generics ------------------------------- */

const baseSchema = {
  firstName: String,
  lastName: String,
  email: {type: String, unique: true},
  password: String,  // Salted + SHA512 hashed
  permissionLevel: { type: String, enum: Object.values(permissionLevels) },
  settings: { type: Schema.Types.Mixed, default: {}},
}

const addSchemaGenerics = (schema) => {
  schema.virtual('fullName').get(function () {
    return this.firstName + " " + this.lastName;
  });
  schema.set('toJSON', {virtuals: true});
  schema.set('toObject', {virtuals: true});
}


/* ------------------------ AmbassadorSite -------------------------- */

const genAmbassadorUserSchema = () => {
  const ambassadorUserSchema = new Schema({
    ...baseSchema,
    ...{
      balance: Number,
      emailVerified: {type: Boolean, default: false},
      socialLinks: [{
        type: {type: String, enum: socialLinkTypes},
        link: String
      }],
      bio: String,
      profileIconName: String,
      skaterSince: Date,
      friends: [{type: mongoose.Types.ObjectId, ref: 'user'}],
      location: {type: mongoose.Types.ObjectId, ref: 'location'},
    },
  }, {timestamps: true});
  ambassadorUserSchema.virtual('submissionCount', {
    ref: 'challengeSubmission',
    localField: '_id',
    foreignField: 'author',
    count: true,
  });
  ambassadorUserSchema.virtual('referralCode', {
    ref: 'referralCode',
    localField: '_id',
    foreignField: 'owner',
    justOne: 'true',
  });
  addSchemaGenerics(ambassadorUserSchema);

  return mongoose.model('user', ambassadorUserSchema);
};


/* ------------------------ StockTracker -------------------------- */

const genStocktrackerUserSchema = () => {
  const stocktrackerUserSchema = new Schema({
    ...baseSchema,
    ...{
      defaultInventory: { type: Schema.Types.ObjectId, ref: 'inventory' },
      defaultCategorySet: { type: Schema.Types.ObjectId, ref: 'categoryset' },
      defaultCSSet: { type: Schema.Types.ObjectId, ref: 'csset' },
    },
  }, {timestamps: true, minimize: false});
  addSchemaGenerics(stocktrackerUserSchema);

  return mongoose.model('user', stocktrackerUserSchema);
};


/* ------------------------ Exports -------------------------- */

module.exports = {
  ambassadorsite: genAmbassadorUserSchema,
  stocktracker: genStocktrackerUserSchema,
}[processMode]();
