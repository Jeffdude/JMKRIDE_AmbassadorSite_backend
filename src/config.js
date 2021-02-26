const { loggingLevels } = require('./constants.js');

module.exports = {
  port: 3600,
  jwt_options: {
    expiresIn: "2d",
  },
  loggingLevel: {
    ambassadorsite: {
      production: loggingLevels.DEBUG,
      development: loggingLevels.VERBOSE_DEBUG,
      unittest: loggingLevels.NONE,
    },
    stocktracker: {
      production: loggingLevels.INFO,
      development: loggingLevels.VERBOSE_DEBUG,
      unittest: loggingLevels.NONE,
    },
  },
  db_url: {
    ambassadorsite: {
      production: "ambassadorsitecluster0.uzrpe.mongodb.net/ambassadorsite-backend?retryWrites=true&w=majority",
      development: "mongodb://localhost:27017/ambassadorsite-backend",
      unittest: "mongodb://localhost:27017/ambassadorsite-backend",
    },
    stocktracker: {
      production: "mongodb://localhost:27017/stocktracker-backend",
      development: "mongodb://localhost:27017/stocktracker-backend",
      unittest: "mongodb://localhost:27017/stocktracker-backend-test",
    },
  },
  usdPerAmbassadorPoint: 0.25,
  mongooseOptions: {
    autoIndex: false, // Don't build indexes
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    // all other approaches are now deprecated by MongoDB:
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  },
};
