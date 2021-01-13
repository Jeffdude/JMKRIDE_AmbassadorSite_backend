const mongoose = require('mongoose');
const { mongooseOptions, db_url } = require('../config.js');
const { processMode, operationMode } = require('../environment.js');

const selected_db_url = db_url[processMode][operationMode]

let count = 0;

mongoose.connectWithRetry = (debug = true) => {
  if(debug){
    console.log('MongoDB connection with retry')
  }
  mongoose.connect(selected_db_url, mongooseOptions).then(()=>{
    if(debug){
      console.log('MongoDB is connected to:', selected_db_url)
    }
    mongoose.connection.on('error', err => {
      console.log('[!] Mongoose Runtime Connection Error:', err);
    });
  }).catch((error) => {
    console.log('MongoDB connection unsuccessful, retry after 5 seconds. ', ++count);
    console.log('[!] MongoDB connection Error:', error);
    setTimeout(() => mongoose.connectWithRetry(debug), 5000)
  })
};

mongoose.connectWithRetry();

module.exports = mongoose;
