const async = require('async');

const mongoose = require('../modules/mongoose.js');
const { operationMode } = require('../environment.js');


module.exports.clearDB_old1 = (callback) => {
  if (operationMode !== 'unittest') {
    throw new Error('Attempt to clear non testing database!');
  }

  const fns = [];

  function createAsyncFn(index) {
    fns.push(async (done) => {
      mongoose.connection.collections[index].drop().catch(() => {})
    });
  }

  for (const i in mongoose.connection.collections) {
    if (
      Object.prototype.hasOwnProperty.call(mongoose.connection.collections, i)
    ) {
      createAsyncFn(i);
    }
  }

  async.parallel(fns, callback);
}

module.exports.clearDB_old2 = async (callback) => {
  const collections = await mongoose.connection.db.collections();

  const fns = [];
  for (let collection of collections) {
    if (
      Object.prototype.hasOwnProperty.call(mongoose.connection.collections, i)
    ) {
      fns.push((callback) => mongoose.connection.dropCollection(collection).then(callback));
    }
  }
  async.parrallel(fns, callback);
};

module.exports.clearDB = (callback) => {
  if (operationMode !== 'unittest') {
    throw new Error('Attempt to clear non testing database!');
  }
  mongoose.connection.dropDatabase().then(() => callback()).catch(console.error);
}
