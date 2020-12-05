const constantModel = require('../constants/model.js');
const adminSecret = require('../environment.js').adminSecret;

exports.getAdminUser = () => {
  return constantModel.getByName('adminUser');
};

exports.adminUserData = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@admin.com',
  password: adminSecret,
}
