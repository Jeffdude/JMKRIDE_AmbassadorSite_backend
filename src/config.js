module.exports = {
  port: 3600,
  jwt_secret: "sup3rs3cr37pw!",
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
  prod_db_url: "mongodb://localhost:27017/ambassadorsite-backend",
  test_db_url: "mongodb://localhost:27017/ambassadorsite-backend-test",
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
