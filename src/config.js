module.exports = {
  port: 3600,
  jwt_options: {
    expiresIn: "2d",
  },
  debug: true,
  permissionLevels: {
    NONE: "none",
    USER: "user",
    AMBASSADOR: "ambassador",
    ADMIN: "admin",
  },
  permissionValues: {
    "none": 0,
    "user": 1,
    "ambassador": 5,
    "admin": 100,
  },
  db_url: {
    ambassadorsite: {
      production: "mongodb://localhost:27017/ambassadorsite-backend",
      development: "mongodb://localhost:27017/ambassadorsite-backend",
      unittest: "mongodb://localhost:27017/ambassadorsite-backend-test",
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
