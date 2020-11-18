const mongoose = require('mongoose');
const { mongooseOptions, prod_db_url, test_db_url } = require('../config.js');
const { operationMode } = require('../environment.js');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = new MongoMemoryServer();

const db_url = async () => {
  return ({
    production: prod_db_url,
    development: prod_db_url,
    unittest: await mongod.getConnectionString(),
  }[operationMode])
}

let count = 0;

const connectWithRetry = async () => {
  console.log('MongoDB connection with retry')
  await mongoose.connect(db_url, mongooseOptions).then(()=>{
    console.log('MongoDB is connected')
  }).catch(() => {
    console.log('MongoDB connection unsuccessful, retry after 5 seconds. ', ++count);
    setTimeout(connectWithRetry, 5000)
  })
};

connectWithRetry();

module.exports = mongoose;
