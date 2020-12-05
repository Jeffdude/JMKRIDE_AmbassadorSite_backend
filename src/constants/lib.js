const async = require('async');

const constantModel = require('./model.js');
const permissionLevels = require('../config.js').permissionLevels;

const userConstants = require('../users/constants.js');
const userModel = require('../users/model.js');

const challengeConstants = require('../challenges/constants.js');
const challengeModel = require('../challenges/model.js');

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


const nameToFn = {
  'adminUser': (debug) => 
    createConstantFn(
      'adminUser',
      userModel.createUser, 
      userConstants.adminUserData,
      (res) => userModel.patchUser(res._id, {permissionsLevel: permissionLevels.ADMIN}),
      debug,
    ),
  'ambassadorApplication': (debug) => 
    createConstantFn(
      'ambassadorApplication',
      challengeModel.createChallenge,
      challengeConstants.ambassadorApplicationData,
      (res) => {},
      debug,
    ),
}

exports.initSiteState = (debug = true) => {
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
            console.log('[+]', key, 'already exists.');
          }
        })
        .catch(console.error)
    )
  });

  Promise.all(buildfns)
    .then(() => {
      async.parallel(fns, () => {
        if(debug) {
          console.log('[+] Server constants nominal.');
        }
      })
    })
    .then(() => {
      console.log("here");
      challengeConstants.getAmbassadorApplication()
        .then(res => {
          console.log("1", res);
          if(res && res.id){
            userConstants.getAdminUser()
              .then(adminUser => {
                console.log("2", adminUser);
                challengeModel.getChallengeById(res.id)
                  .then(ambassadorApplication => {
                    console.log("3", ambassadorApplication);
                    if(ambassadorApplication && ambassadorApplication.creator === undefined){
                      challengeModel.updateChallengeById(
                        ambassadorApplication._id,
                        {creator: adminUser.id},
                        res => {
                          console.log(res);
                          if(res.creator !== undefined) {
                            if(debug) {
                              console.log('[+] Ambassador Application creator set.')
                            }
                          }
                        },
                      )
                      .catch(console.error);
                    }
                  })
                  .catch(console.error)
              })
              .catch(console.error)
          }
        })
        .catch(console.error)
    })
    .catch(console.error);
  
};
