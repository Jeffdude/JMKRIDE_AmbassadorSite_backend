const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;

const inventoryConstants = require('./constants.js')


/*             ┌──────────┐  ┌───────────┐
 *             │Inventory │  │ Inventory │ ...
 *             └▲─────────┘  └───▲───────┘
 *              │   One:All      │
 *              │    ┌───────────┘
 *              │    │
 * Inventory  ┌─┴────┴──┐            ┌──────────┐            ┌──────────────┐
 * Model      │Part     │ Many:One   │Category  │ Many:One   │CategorySet   │
 * Hierarchy  │         ├───────────►│          ├───────────►│              │
 *            │         │ (Ordered)  │          │ (Ordered)  │              │
 *            └─────────┘            └──────────┘            └──────────────┘
 *               ...                    ...                        ...
 */

/* Inventory
 *  - unique collections of quantities of parts
 *    * useful for storefront/back office, or remote countries like
 *      Canada/Brazil
 *
 */
const inventorySchema = new Schema({
  name: String,
  description: String,
  creator: {type: Schema.Types.ObjectId, ref: 'user'},
  initialized: false, // for development mode
}, {timestamps: true});
const Inventory = mongoose.model('inventory', inventorySchema);

/* CategorySet
 * - an orderable collection of categories
 *   * maybe not that useful with num_inventory = 1
 *     but with different inventories, it'll be useful to have different
 *     categories + orderings
 */
const categorySetSchema = new Schema(
  {name: String},
  {
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
);
categorySetSchema.virtual('length', {
  ref: 'categorysetorder',
  localField: '_id',
  foreignField: 'categorySets.categorySet',
  count: true,
});
const CategorySet = new mongoose.model('categoryset', categorySetSchema);
const categorySetOrderSchema = new Schema({
  sortIndex: Number,
  categorySet: {type: Schema.Types.ObjectId, ref: 'categoryset'},
}, {timestamps: true});
mongoose.model('categorysetorder', categorySetOrderSchema);


/* Category
 * - orderable collection of parts
 */
const categorySchema = new Schema(
  {
    name: String,
    categorySets: [
      {sortIndex: Number, categorySet: {type: Schema.Types.ObjectId, ref: 'categoryset'}}
    ],
  },
  {
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
    timestamps: true,
  },
);
categorySchema.virtual('length', {
  ref: 'part',
  localField: '_id',
  foreignField: 'categories.category',
  count: true,
});
const Category = mongoose.model('category', categorySchema)

/* Part
 *  - quantityMap: {Inventory: Quantity Number}
 * get by category:
 *  parts.find("categoryOrders.category: <category_id>).sort({['categoryOrders.sortIndex']: 1})
 */
const partSchema = new Schema({
  name: String,
  color: {type: String, enum: inventoryConstants.PART_COLORS},
  categories: [
    {sortIndex: Number, category: {type: Schema.Types.ObjectId, ref: 'category'}}
  ],
  creator: {type: Schema.Types.ObjectId, ref: 'user'},
  quantityMap: {type: Map, of: Number},
}, {timestamps: true});
partSchema.index({
  name: 'text',
  color: 'text',
  'categories.category': 'text',
});
const Part = mongoose.model('part', partSchema);

const CSSetSchema = new Schema(
  {name: String},
  {
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
    timestamps: true,
  },
);
CSSetSchema.virtual('length', {
  ref: 'completeset',
  localField: '_id',
  foreignField: 'CSSets.CSSet',
  count: true,
});
const CSSet = mongoose.model('csset', CSSetSchema);
const completeSetSchema = new Schema({
  name: String,
  color: {type: String, enum: inventoryConstants.PART_COLORS},
  creator: {type: Schema.Types.ObjectId, ref: 'user'},
  CSSets: [
    {sortIndex: Number, CSSet: {type: Schema.Types.ObjectId, ref: 'csset'}},
  ],

  lwheel1: {type: Schema.Types.ObjectId, ref: 'part', required: true},
  lwheel2: {type: Schema.Types.ObjectId, ref: 'part', required: true},
  ltruck: {type: Schema.Types.ObjectId, ref: 'part', required: true},
  ldeck: {type: Schema.Types.ObjectId, ref: 'part', required: true},
  lgrip: {type: Schema.Types.ObjectId, ref: 'part', required: true},

  rwheel1: {type: Schema.Types.ObjectId, ref: 'part', required: true},
  rwheel2: {type: Schema.Types.ObjectId, ref: 'part', required: true},
  rtruck: {type: Schema.Types.ObjectId, ref: 'part', required: true},
  rdeck: {type: Schema.Types.ObjectId, ref: 'part', required: true},
  rgrip: {type: Schema.Types.ObjectId, ref: 'part', required: true},
}, {timestamps: true});
const CompleteSet = mongoose.model('completeset', completeSetSchema);

const logSchema = new Schema({
  actor: {type: Schema.Types.ObjectId, ref: 'user'},
  action: {type: String, enum: Object.values(inventoryConstants.actions)},
  subject: {type: Schema.Types.ObjectId, refPath: 'subjectType'},
  subjectType: String,
  quantity: Number,
  payload: {type: Schema.Types.Mixed},
}, {timestamps: true});
const Log = mongoose.model('log', logSchema);


/* ------------------  Inventory Model Definitions ------------------  */

/*   Parts    */
exports.createPart = (partData) => {
  const part = new Part(partData);
  return part.save()
};

exports.patchPart = (id, partData) =>
  Part.findOneAndUpdate({
    _id: id
  }, partData);

exports.updatePartQuantity = async ({ partId, inventoryId, quantity }) => {
  const part = await Part.findById(partId);
  const stringInventoryId = inventoryId.toString()

  if(! part.quantityMap.get(stringInventoryId)) {
    part.quantityMap.set(stringInventoryId, 0);
  }
  part.quantityMap.set(
    stringInventoryId,
    part.quantityMap.get(stringInventoryId) + quantity,
  )
  return part.save({new: true});
};

exports.getPartById = (partId) =>
  Part.findById(partId).populate('creator')
    .populate('creator').populate('categories.category');

exports.deletePartById = (partId) =>
  Part.findOneAndDelete({"_id": partId});

exports.getPartsById = (partIds) =>
  Part.find({"_id": {"$in": partIds}})
    .populate('creator').populate('categories.category');

exports.patchPart = (partId, partData) => 
  Part.findOneAndUpdate({"_id": partId}, {'$set': partData});

exports.getAllParts = () => Part.find().populate('categories.category');
exports.searchAllParts = (query) => Part.find(
  {$text: {$search: query}}
).populate('categories.category');

exports.setPartCategoryOrder = ({partId, categoryId, sortIndex}) =>
  Part.findOneAndUpdate(
    {'_id': partId, 'categories.category': categoryId},
    {'$set': {'categories.$.sortIndex': sortIndex}},
  );

exports.addPartToCategory = ({partId, categoryId}) =>
  Part.findById(partId).then(async part => {
    let inCategory = part.categories.filter(category => category.category === categoryId).length;
    if(inCategory) return;
    let sortIndex = (await exports.getCategoryById(categoryId)).length;
    part.categories.push({category: categoryId, sortIndex})
    return part.save();
  })
exports.removePartFromCategory = ({partId, categoryId}) =>
  Part.findOneAndUpdate(
    {"_id": partId},
    {$pull: { categories: { category: categoryId}}},
  );

/*
 * getPartsByCategory
 *  Returns - parts in category
 *    * javascript objects (not documents)
 *    * these JS objects are 100% sufficient for returning to the client,
 *      but cannot be modified or save()d
 */
exports.getPartsByCategory = ({ categoryId }) =>
  Part.aggregate([
    /* elemMatch any part belonging to this category */
    {'$match': {'categories.category': mongoose.Types.ObjectId(categoryId)}},
    /* expand those parts into one doc per category */
    {'$unwind': '$categories'},
    /* re-match only those part-category pairs that are this category*/
    {'$match': {'categories.category': mongoose.Types.ObjectId(categoryId)}},
    /* sort by the sortIndex */
    {'$sort': {'categories.sortIndex': 1}},
    /* remove the modified 'categories' field for bug avoidance */
    {'$project': {'categories': 0}},
  ]);

exports.getPartIdsByCategory = ({ categoryId }) =>
  Part.aggregate([
    /* elemMatch any part belonging to this category */
    {'$match': {'categories.category': mongoose.Types.ObjectId(categoryId)}},
    /* group into an array of ids */
    {'$group': {_id: null, array: {"$push": "$_id"}}},
    {'$project': {array: true, _id: false}},
  ]).then(result => result[0].array);


/*   Categories    */
exports.createCategory = (categoryData) => {
  const category = new Category(categoryData);
  return category.save();
};
const categoryPopulateProps = ['length', 'categorySets.categorySet'];
exports.deleteCategory = (categoryId) =>
  Category.findOneAndDelete({_id: categoryId})
exports.getCategoryById = (categoryId) =>
  Category.findById(categoryId)
  .then(results => Category.populate(results, categoryPopulateProps));
exports.getCategoriesById = (categoryIds) =>
  Category.find({"_id": {"$in": categoryIds}})
  .then(results => Category.populate(results, categoryPopulateProps));
exports.getAllCategories = () => Category.find()
  .then(results => Category.populate(results, categoryPopulateProps));
exports.patchCategory = (id, categoryData) =>
  Category.findOneAndUpdate({
    _id: id
  }, categoryData);

exports.setCategoryCategorySetOrder = ({categoryId, categorySetId, sortIndex}) =>
  Category.findOneAndUpdate(
    {'_id': categoryId, 'categorySets.categorySet': categorySetId},
    {'$set': {'categorySets.$.sortIndex': sortIndex}}
  );
exports.getCategoriesByCategorySet = ({categorySetId}) =>
  Category.aggregate([
    /* elemMatch any categories belonging to this categorySet */
    {'$match': {'categorySets.categorySet': mongoose.Types.ObjectId(categorySetId)}},
    /* expand those categories into one doc per categorySet */
    {'$unwind': '$categorySets'},
    /* re-match only those category-categorySet pairs that are this categorySet*/
    {'$match': {'categorySets.categorySet': mongoose.Types.ObjectId(categorySetId)}},
    /* sort by the sortIndex */
    {'$sort': {'categorySets.sortIndex': 1}},
    /* remove the modified 'categories' field for bug avoidance */
    {'$project': {'categorySets': 0}},
  ]).then(results => Category.populate(results, categoryPopulateProps));

exports.removeCategoryFromCategorySet = ({categoryId, categorySetId}) =>
  Category.findOneAndUpdate(
    {_id: categoryId}, 
    {$pull: {categorySets: {categorySet: categorySetId}}},
  );
exports.addCategoryToCategorySet = ({categoryId, categorySetId}) =>
  exports.getCategoryById(categoryId).then(category =>
    exports.getCategorySetById(categorySetId).then(categorySet => {
      console.log("csetId:", categorySetId);
      category.categorySets.push(
        {categorySet: categorySetId, sortIndex: categorySet.length}
      )
      return category.save();
    })
  );

/*   Category Sets    */
exports.createCategorySet = (categorySetData) => {
  const categoryset = new CategorySet(categorySetData);
  return categoryset.save();
};
const categorySetPopulators = ['length'];
exports.patchCategorySet = (categorySetId, categorySetData) =>
  CategorySet.findOneAndUpdate({"_id": categorySetId}, {$set: categorySetData});
exports.deleteCategorySet = (categorySetId) =>
  CategorySet.findOneAndRemove({_id: categorySetId})
exports.getCategorySetById = (categorySetId) => CategorySet.findById(categorySetId)
  .then(results => CategorySet.populate(results, categorySetPopulators));
exports.getCategorySetsById = (categorySetIds) =>
  CategorySet.find({"_id": {"$in": categorySetIds}})
  .then(results => CategorySet.populate(results, categorySetPopulators));
exports.getAllCategorySets = () => CategorySet.find()
  .then(results => CategorySet.populate(results, categorySetPopulators));

/*   CompleteSets    */
const getPopulateOptions = () => [
  ...inventoryConstants.CSPropertyList, 'creator', 'CSSets.CSSet'
].map(prop => ({path: prop, transform: doc => doc.toObject()}));
exports.createCompleteSet = (completeSetData) => {
  const completeset = new CompleteSet(completeSetData);
  return completeset.save();
};
exports.patchCompleteSet = (completeSetId, CSData) => 
  CompleteSet.findOneAndUpdate({"_id": completeSetId}, {"$set": CSData});
exports.createCSSet = (CSSetData) => {
  const newCSSet = new CSSet(CSSetData);
  return newCSSet.save();
};
exports.patchCSSet = (CSSetId, CSSetData) =>
  CSSet.findOneAndUpdate({"_id": CSSetId}, {$set: CSSetData});
exports.getCSSetById = (CSSetId) => CSSet.findById(CSSetId).populate('length');
exports.getCompleteSetById = (completeSetId) =>
  CompleteSet.findById(completeSetId)
  .then(results => CompleteSet.populate(results, getPopulateOptions()));
exports.getAllCompleteSets = () => CompleteSet.find()
  .then(results => CompleteSet.populate(results, getPopulateOptions()));
exports.createCSSet = (CSSetData) => {
  let cSSet = new CSSet(CSSetData);
  return cSSet.save()
}
exports.deleteCSSet = (CSSetId) => CSSet.findById(CSSetId).remove();
exports.addCompleteSetToCSSetId = ({completeSetId, CSSetId}) =>
  CompleteSet.findById(completeSetId).then(async completeSet => {
    let inCSSet = completeSet.CSSets.filter(CSSet => CSSet.CSSet === CSSetId).length;
    if(inCSSet) return;
    let sortIndex = (await exports.getCSSetById(CSSetId)).length;
    completeSet.CSSets.push({CSSet: CSSetId, sortIndex})
    return completeSet.save();
  })
exports.removeCompleteSetFromCSSetId = ({completeSetId, CSSetId}) =>
  CompleteSet.findOneAndUpdate(
    {"_id": completeSetId},
    {$pull: { CSSets: { CSSet: CSSetId}}},
  );

exports.getCompleteSets = ({ CSSetId }) =>
  CompleteSet.aggregate([
    /* elemMatch any part belonging to this CSSet */
    {'$match': {'CSSets.CSSet': mongoose.Types.ObjectId(CSSetId)}},
    /* expand those CS into one doc per category */
    {'$unwind': '$CSSets'},
    /* re-match only those CS-CSSet pairs that are this CSSet*/
    {'$match': {'CSSets.CSSet': mongoose.Types.ObjectId(CSSetId)}},
    /* sort by the sortIndex */
    {'$sort': {'CSSets.sortIndex': 1}},
    /* remove the modified 'CSSets' field for bug avoidance */
    {'$project': {'CSSets': 0}},
  ]).then(results => CompleteSet.populate(results, getPopulateOptions()));
exports.getAllCSSets = () => CSSet.find();
exports.setCSCSSetOrder = ({CSId, CSSetId, sortIndex}) =>
  CompleteSet.findOneAndUpdate(
    {'_id': CSId, 'CSSets.CSSet': CSSetId},
    {'$set': {'CSSets.$.sortIndex': sortIndex}},
  );
exports.deleteCS = (CSId) => CompleteSet.findById(CSId).remove();

/*   Logs    */
exports.createLog = (logData) => {
  const log = new Log(logData);
  return log.save();
}

exports.getLogsByCategory = ({categoryId, perPage = 150, page = 0}) =>
  exports.getPartIdsByCategory({categoryId}).then(result =>
    Log.find({subjectType: "part", subject: {$in: result}})
      .populate("actor", ["firstName", "lastName"])
      .populate("subject")
      .sort({createdAt: -1})
      .limit(perPage)
      .skip(perPage * page)
  );

exports.getLogsByPart = ({partId, perPage = 150, page = 0}) =>
  Log.find({subjectType: "part", subject: partId})
    .populate("actor", ["firstName", "lastName"])
    .populate("subject")
    .sort({createdAt: -1})
    .limit(perPage)
    .skip(perPage * page);

exports.getLogsByUser = ({userId, perPage = 150, page = 0}) =>
  Log.find({actor: userId})
    .populate("actor", ["firstName", "lastName"])
    .populate("subject")
    .sort({createdAt: -1})
    .limit(perPage)
    .skip(perPage * page);

exports.getLogs = ({perPage = 150, page = 0}) =>
  Log.find()
    .populate("actor", ["firstName", "lastName"])
    .populate("subject")
    .sort({createdAt: -1})
    .limit(perPage)
    .skip(perPage * page);

/* Inventories */

exports.createInventory = (inventoryData) => {
  const inventory = new Inventory(inventoryData);
  return inventory.save();
}
exports.getInventoryById = (inventoryId) =>
  Inventory.findById(inventoryId).populate("creator");
exports.getAllInventories = () =>
  Inventory.find().populate("creator");
exports.patchInventory = (inventoryId, patchData) =>
  Inventory.findOneAndUpdate({_id: inventoryId}, patchData);
exports.deleteInventory = (inventoryId) =>
  Inventory.findOneAndDelete({_id: inventoryId});
