const constantModel = require('../constants/model.js');

const categories = [
  "Wheel",
  "Truck",
  "Deck",
  "Grip",
  // Other parts of Complete Sets
  // that are always included e.g. screw kits, shock pads, & bearings
  "Auxiliary",
  "Shipping", // Boxes, truck inserts, Learn brochures
  "Accessory", // Optional parts of CS (Edge guards, etc)
  "Apparel", // Shirts, Bags, etc
  "Other", // Stickers, etc
];
module.exports.categories = categories;

const colors = [ // Order from custom tool
  "Black",
  "White",
  "Cyan",
  "Pink",
  "Red",
  "Yellow",
  "Orange",
  "Lavender",
  "Green",
  "Marine",
  "Purple",
  "Mint",
  "Chrome",
  "Silver",
  "Sakura",
  "Brown",
];
module.exports.colors = colors;

module.exports.inventories = ["JMKRIDE-USA-BackOffice"]
module.exports.defaultDefaultInventory = "JMKRIDE-USA-BackOffice";
module.exports.getDefaultDefaultInventoryId = () => constantModel.getByName(
  module.exports.defaultDefaultInventory
).then(doc => doc.id)

module.exports.categorySets = ["Default Category Set"]
module.exports.defaultDefaultCategorySet = "Default Category Set";
module.exports.getDefaultDefaultCategorySetId = () => constantModel.getByName(
  module.exports.defaultDefaultCategorySet
).then(doc => doc.id)

module.exports.CSSets = ["Default CS Set"]
module.exports.defaultDefaultCSSet = "Default CS Set";
module.exports.getDefaultDefaultCSSetId = () => constantModel.getByName(
  module.exports.defaultDefaultCSSet
).then(doc => doc.id)

const genAllParts = () => {
  const partTypeToPartColors = {
    "Wheel": colors.filter(
      color => !(["Brown", "Chrome", "Silver", "Sakura"].includes(color))
    ),
    "Truck": colors.filter(
      color => !(["Brown"].includes(color))
    ),
    "Deck": colors.filter(
      color => !(["Brown"].includes(color))
    ),
  }


  // Standard Color Parts for complete sets
  let standardParts = [];
  Object.keys(partTypeToPartColors).map(partType =>
    standardParts = standardParts.concat(
      partTypeToPartColors[partType].map(partColor => ({
        name: partColor + " " + partType,
        color: partColor,
        categoryName: partType, // will be persisted as category in postprocessing
        quantityMap: {},
      }))
    )
  );

  const createPartsWithType = (type, parts) =>
    parts.map(part => ({
      name: part[0],
      color: part[1],
      categoryName: type,
      quantityMap: {},
    }));

  let gripParts = createPartsWithType("Grip", [
    ["Black/White Logo", "Black"],
    // TODO
  ]);

  let auxiliaryParts = createPartsWithType("Auxiliary", [
    ["Screw Kit", "Silver"],
    ["Shock Pad", "White"],
    ["Bearing", "Black"],
  ]);

  let shippingParts = createPartsWithType("Shipping", [
    ["CS Box", "Cyan"],
    ["8x8x4 Standard Box", "Brown"],
    ["Truck Insert", "Cyan"],
  ]);

  let accessoryParts = createPartsWithType("Accessory", []);
  let apparelParts = createPartsWithType("Apparrel", []);

  let otherParts = createPartsWithType("Other", [
    ["Sticker Sheet", "White"],
  ]);

  return standardParts
    .concat(gripParts)
    .concat(auxiliaryParts)
    .concat(shippingParts)
    .concat(accessoryParts)
    .concat(apparelParts)
    .concat(otherParts);
};

module.exports.allParts = genAllParts();

module.exports.actions = {
  CREATE: "CREATE",                       // create part/complete set
  MODIFY: "MODIFY",                       // edit data of a part/complete set
  DELETE: "DELETE",                       // delete part/complete set
  UPDATE_QUANTITY: "UPDATE_QUANTITY",     // add/subtract from an inventory
  TRANSFER_QUANTITY: "TRANSFER_QUANTITY", // transfer to/from inventories
};

module.exports.CSPropertyList = [
  'lwheel1', 'lwheel2',
  'ltruck', 'ldeck', 'lgrip',
  'rwheel1', 'rwheel2',
  'rtruck', 'rdeck', 'rgrip',
]
