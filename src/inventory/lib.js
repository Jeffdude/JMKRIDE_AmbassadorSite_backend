const inventoryModel = require('./model.js');
const { inventoryActions } = require('./constants.js');

const executeAndLog = (fn, { action, actor, amount, partId }) => 
  fn().then(() => 
    inventoryModel.createLog({
      actor: actor,
      action: action,
      partId: partId,
      amount: amount,
    })
  );

exports.createPart = ({actor, ...partData}) =>
  executeAndLog(
    () => inventoryModel.createPart(partData),
    {
      action: inventoryActions.CREATE,
      actor: actor,
      partId: partData.partId,
      amount: partData.quantity,
    }
  );

exports.updatePartQuantity = ({actor, partId, quantity}) =>
  executeAndLog(
    () => inventoryModel.updatePartQuantity(
      { partId: partId, quantity: quantity }
    ),
    {
      action: inventoryActions.UPDATE,
      actor: actor,
      partId: partId,
      amount: quantity,
    },
  );
