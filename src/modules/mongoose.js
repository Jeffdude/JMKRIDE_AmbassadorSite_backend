const mongoose = require('mongoose');
const { mongooseOptions, db_url } = require('../config.js');
const {
  mongoDBUser,
  mongoDBPassword,
  processMode,
  operationMode
} = require('../environment.js');


let count = 0;

const getMongoDBUrl = () => {
  if (processMode === "stocktracker" || operationMode === "development") {
    return db_url[processMode][operationMode]
  }
  return ( 
    "mongodb+srv://" + mongoDBUser + ":" + mongoDBPassword + "@" + 
    db_url[processMode][operationMode]
  )
}

let full_db_url = getMongoDBUrl()
console.log(full_db_url);

mongoose.connectWithRetry = (debug = true) => {
  if(debug){
    console.log('MongoDB connection with retry')
  }
  mongoose.connect(full_db_url, mongooseOptions).then(()=>{
    if(debug){
      console.log('MongoDB is connected to:', full_db_url)
    }
    mongoose.connection.on('error', err => {
      console.log('[!] Mongoose Runtime Connection Error:', err);
    });
  }).catch((error) => {
    console.log('MongoDB connection to', full_db_url, 'unsuccessful, retry after 5 seconds. ', ++count);
    console.log('[!] MongoDB connection Error:', error);
    setTimeout(() => mongoose.connectWithRetry(debug), 5000)
  })
};

mongoose.connectWithRetry();

module.exports = mongoose;
