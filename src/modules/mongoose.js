const mongoose = require('mongoose');
const { mongooseOptions, prod_db_url, test_db_url } = require('../config.js');
const { operationMode } = require('../environment.js');

const db_url = {
  production: prod_db_url,
  development: prod_db_url, //FIXME
  unittest: test_db_url,
}[operationMode]

let count = 0;

const connectWithRetry = () => {
  console.log('MongoDB connection with retry')
  mongoose.connect(db_url, mongooseOptions).then(()=>{
    console.log('MongoDB is connected to:', db_url)
    mongoose.connection.on('error', err => {
      console.log('[!] Mongoose Runtime Connection Error:', err);
    });
  }).catch((error) => {
    console.log('MongoDB connection unsuccessful, retry after 5 seconds. ', ++count);
    console.log('[!] MongoDB connection Error:', error);
    setTimeout(connectWithRetry, 5000)
  })
};

connectWithRetry();

module.exports = mongoose;
