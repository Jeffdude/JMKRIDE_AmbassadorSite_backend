const async = require('async');

const constantModel = require('./model.js');
const userModel = require('../users/model.js');
const adminSecret = require('../environment.js').adminSecret;
const permissionLevels = require('../config.js').permissionLevels;

exports.getAdminUserId = () => {
  return constantModel.getByName('adminUser');
};

exports.getAmbassadorApplication = () => {
  return constantModel.getByName('ambassadorApplication');
};

const createConstantFn = (
  constantName, creationFn, data, thenFn = (res => res), debug = true,
) => (done) => {
  creationFn(data)
    .then((res) => {
      if(! res) {
        throw new Error('Failed to create constant:', data, res);
      }
      
      if(res._id) {
        constantModel.createConstant({
          name: constantName,
          id: res._id,
        })
          .then((res) => {
            thenFn(res)
              .then(() => {
                if(debug) {
                  console.log('[+] Created constant:', constantName);
                }
                done();
              })
              .catch(err => done(err));
          })
          .catch(err => done(err));
      } else {
        throw new Error('Failed to create constant:', data, res.error);
      }
  })
  .catch(err => {
    console.log('[!] Error creating', constantName, ':', err.message);
    done(err);
  });
};


const createAdminUser = (debug) => 
  createConstantFn(
    'adminUser',
    userModel.createUser, 
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@admin.com',
      password: adminSecret,
    },
    (res) => userModel.patchUser(res._id, {permissionsLevel: permissionLevels.ADMIN}),
    debug,
  );

const nameToFn = {
  'adminUser': createAdminUser
}

exports.initAmbassadorSiteState = (debug = true) => {
  let buildfns = []; // functions to check constants and compile create funcs if needed
  let fns = [];      // all create funcs

  Object.keys(nameToFn).map(key => {
    buildfns.push(
      constantModel.getByName(key)
        .then(res => {
          if(! res) {
            if(debug) {
              console.log('[+]', key, 'not found. Creating...');
            }
            fns.push(nameToFn[key](debug));
          } else if(debug) {
            console.log('[+] Admin User already exists.');
          }
        })
        .catch(console.error)
    )
  });

  Promise.all(buildfns).then(() => {
    async.parallel(fns, () => {
      if(debug) {
        console.log('[+] Server constants nominal.');
      }
    })
  }).catch(console.error);
};
