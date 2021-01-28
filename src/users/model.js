const mongoose = require('../modules/mongoose.js');
const Schema = mongoose.Schema;

const permissionLevels = require('../config.js').permissionLevels;


/* ------------------  User Model Definition ------------------  */

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: {type: String, unique: true},
  password: String,  // Salted + SHA512 hashed
  permissionLevel: { type: String, enum: Object.values(permissionLevels) },
  ambassadorBalance: Number,
}, {timestamps: true});

userSchema.virtual('submissionCount', {
  ref: 'challengeSubmission',
  localField: '_id',
  foreignField: 'author',
  count: true,
});
userSchema.set('toJSON', {virtuals: true});

const User = mongoose.model('user', userSchema);


/* ------------------  User Model Functions ------------------  */

exports.findByEmail = (email) => {
  return User.find({email: email});
};

exports.findById = (id) => {
  return User.findById(id)
    .then((result) => {
      return result;
    });
};

exports.createUser = (userData) => {
  const user = new User(userData);
  return user.save();
};

exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    User.find()
      .populate('submissionCount')
      .limit(perPage)
      .skip(perPage * page)
      .exec(function (err, users) {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      })
  });
};

exports.patchUser = (id, userData) => {
  return User.findOneAndUpdate({
    _id: id
  }, userData);
};

exports.removeById = (userId) =>{
  return new Promise((resolve, reject) => {
    User.deleteMany({_id: userId}, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(err);
      }
    });
  });
};
