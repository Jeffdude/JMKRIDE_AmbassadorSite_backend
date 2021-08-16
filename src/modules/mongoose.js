const mongoose = require('mongoose');
const { mongooseOptions, db_url } = require('../config.js');
const {
  mongoDBUser,
  mongoDBPassword,
  processMode,
  operationMode
} = require('../environment.js');
const { logInfo, logError } = require('../modules/errors.js');


let count = 0;

const getMongoDBUrl = () => {
  if (["development", "unittest"].includes(operationMode)) {
    return db_url[processMode][operationMode]
  }
  return ( 
    "mongodb+srv://" + mongoDBUser + ":" + mongoDBPassword + "@" + 
    db_url[processMode][operationMode]
  )
}

let full_db_url = getMongoDBUrl()

mongoose.connectWithRetry = () => {
  logInfo('MongoDB connection with retry:', full_db_url)
  mongoose.connect(full_db_url, mongooseOptions).then(()=>{
    logInfo('MongoDB is connected.')
    mongoose.connection.on('error', err => {
      logError('[!] Mongoose Runtime Connection Error:', err);
    });
  }).catch((error) => {
    logError('MongoDB connection unsuccessful, retry after 5 seconds. ', ++count);
    logError('[!] MongoDB connection Error:', error);
    setTimeout(() => mongoose.connectWithRetry(), 5000)
  })
};

mongoose.connectWithRetry();

module.exports = mongoose;
