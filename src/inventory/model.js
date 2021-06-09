const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;

const partConstants = require('./constants.js')


/*             ┌──────────┐  ┌───────────┐
 *             │Inventory │  │ Inventory │ ...
 *             └▲─────────┘  └───▲───────┘
 *              │   One:All      │
 *              │    ┌───────────┘
 *              │    │
 * Inventory  ┌─┴────┴──┐            ┌──────────┐            ┌──────────────┐
 * Model      │Part     │ One:Many   │Category  │ One:Many   │CategorySet   │
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
const inventorySchema = new Schema({name: String});
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
});
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
  color: {type: String, enum: partConstants.PART_COLORS},
  categories: [
    {sortIndex: Number, category: {type: Schema.Types.ObjectId, ref: 'category'}}
  ],
  creator: {type: Schema.Types.ObjectId, ref: 'user'},
  quantityMap: {type: Map, of: Number},
});
const Part = mongoose.model('part', partSchema);

const completeSetSchema = new Schema({
  name: String,
  enabledInventories: [{type: Schema.Types.ObjectId, ref: 'inventory'}],
  sortIndex: Number,

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
  subjectId: {type: Schema.Types.ObjectId, refPath: 'targetType'},
  subjectType: String,
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

exports.updatePartQuantity = ({ partId, inventoryId, quantity }) => {
  const part = Part.findById(partId);
  part.quantityMap[inventoryId] = part.quantityMap[inventoryId] + quantity;
  return part.save();
};

exports.getPartById = (partId) =>
  Part.findById(partId);

exports.getPartsById = (partIds) =>
  Part.find({"_id": {"$in": partIds}});

exports.setPartCategoryOrder = ({partId, categoryId, sortIndex}) =>
  Part.findOneAndUpdate(
    {'_id': partId, 'categories.category': categoryId},
    {'$set': {'categories.$.sortIndex': sortIndex}},
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


/*   Categories    */
exports.createCategory = (categoryData) => {
  const category = new Category(categoryData);
  return category.save();
};
exports.deleteCategory = (categoryId) =>
  Category.findOneAndDelete({_id: categoryId})
exports.getCategoryById = (categoryId) =>
  Category.findById(categoryId).populate('length');
exports.getCategoriesById = (categoryIds) =>
  Category.find({"_id": {"$in": categoryIds}}).populate('length');
exports.getAllCategories = () => Category.find();
/*
 * getCategoriesByCategorySet
 *  Returns - categories in categorySet
 *    * javascript objects (not documents)
 *    * these JS objects are 100% sufficient for returning to the client,
 *      but cannot be modified or save()d
 */
exports.getCategoriesByCategorySet = ({categorySetId}) =>
  Category.aggregate([
    /* elemMatch any categories belonging to this categorySet */
    {'$match': {'categorySets.category': mongoose.Types.ObjectId(categorySetId)}},
    /* expand those categories into one doc per categorySet */
    {'$unwind': '$categorySets'},
    /* re-match only those category-categorySet pairs that are this categorySet*/
    {'$match': {'categorySets.category': mongoose.Types.ObjectId(categorySetId)}},
    /* sort by the sortIndex */
    {'$sort': {'categorySets.sortIndex': 1}},
    /* remove the modified 'categorySets' field for bug avoidance */
    {'$project': {'categorySets': 0}},
  ]);

//exports.getCategorySetCategories = ({categorySetId}) =>

/*   Category Sets    */
exports.createCategorySet = (categorySetData) => {
  const categoryset = new CategorySet(categorySetData);
  return categoryset.save();
};
exports.deleteCategorySet = (categorySetId) =>
  CategorySet.findOneAndDelete({_id: categorySetId})
exports.getCategorySetById = (categorySetId) => CategorySet.findById(categorySetId);
exports.getCategorySetsById = (categorySetIds) => 
  CategorySet.find({"_id": {"$in": categorySetIds}});

/*   Inventories    */
exports.createInventory = (inventoryData) => {
  const inventory = new Inventory(inventoryData);
  return inventory.save();
};
exports.deleteInventory = (inventoryId) =>
  Inventory.findOneAndDelete({_id: inventoryId})

/*   CompleteSets    */
exports.createCompleteSet = (completeSetData) => {
  const completeset = new CompleteSet(completeSetData);
  return completeset.save();
};
exports.getCompleteSets = (inventoryId) =>
  CompleteSet.find(inventoryId ? {enabledInventories: inventoryId} : {})
    .sort({sortIndex: 1});


/*   Logs    */
exports.createLog = (logData) => {
  const log = new Log(logData);
  return log.save();
}

exports.debug = async () => {
  //console.log((await exports.getCategoryById("609c3a19f0bbf1efaa2e1ea7")).length);
  console.log(
    await exports.getPartById(
      (await exports.getCategoryParts({categoryId: "609d9fc1c8cff990906eee19"}))[0]._id
    )
  );
  //console.log(await exports.setPartCategoryOrder({
  //  partId: "609c3a19f0bbf1efaa2e1e8c",
  //  categoryId: "609c3a19f0bbf1efaa2e1ea7",
  //  sortIndex: 5,
  //}));
}

exports.getLogs = (perPage = 150, page = 0) =>
  Log.find()
    .populate('target')
    .sort({createdAt: 1})
    .limit(perPage)
    .skip(perPage * page);
