const constantModel = require('../constants/model.js');
const inventoryModel = require('./model.js');

module.exports.PART_TYPES = [
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

module.exports.PART_COLORS = [ // Order from custom tool
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

const partTypeToPartColors = {
  "Wheel": module.exports.PART_COLORS.filter(
    color => !(["Brown", "Chrome", "Silver", "Sakura"].includes(color))
  ),
  "Truck": module.exports.PART_COLORS.filter(
    color => !(["Brown"].includes(color))
  ),
  "Deck": module.exports.PART_COLORS.filter(
    color => !(["Brown"].includes(color))
  ),
}


// Standard Color Parts for complete sets
let standardParts = []
Object.keys(partTypeToPartColors).map(partType => 
  standardParts = standardParts.concat(
    partTypeToPartColors[partType].map(partColor => ({
      name: partColor + " " + partType,
      color: partColor,
      type: partType,
      quantity: 0,
    }))
  )
);

const createPartsWithType = (type, parts) =>
  parts.map(part => ({
    name: part[0],
    color: part[1],
    type: type,
    quantity: 0,
  }));

let gripParts = createPartsWithType("Grip", [
  ["Black&White Logo", "Black"],
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

module.exports.allParts = standardParts
  .concat(gripParts)
  .concat(auxiliaryParts)
  .concat(shippingParts)
  .concat(accessoryParts)
  .concat(apparelParts)
  .concat(otherParts);
