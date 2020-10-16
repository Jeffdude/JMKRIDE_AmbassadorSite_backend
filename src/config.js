module.exports = {
  port: 3600,
  jwt_secret: "sup3rs3cr37pw!",
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
};
