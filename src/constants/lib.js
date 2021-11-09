const { logInfo, logError } = require('../modules/errors.js');

const constantsModel = require('./model.js');
const constantsInitializer = require('./initializer.js');


/*
 * createConstantPromise
 *  Fn(
 *    constantName::String - unique name of the constant to create
 *    type::String - mongodb model name 
 *    creationFn::Fn (data::Object => Promise(mongoose document))
 *      - function that takes constant's data, returns Promise to create mongoose document
 *      - will be 'await'ed
 *    data::Object - data to create the constant with
 *  => 
 *    Promise(mongoosedocument)
 *  )
 */
const createConstantPromise = (
  constantName, type, creationFn, data,
) => {
  return new Promise((resolve, reject) => {
    creationFn(data)
      .then((res) => {
        if(! res) {
          reject(new Error('Failed to create constant:', constantName, data, res));
        }
        if(res._id) {
          constantsModel.createConstant({
            name: constantName,
            id: res._id,
            type: type,
          }).then(() => {
            logInfo('[+] Created constant:', constantName);
            resolve([constantName, res]);
          })
          .catch(err => {
            logError('[!] Error creating Constant mongoose document');
            reject(err);
          });
        } else {
          reject(new Error('Failed to create constant:', constantName, data, res.error));
        }
      })
      .catch(err => {
        logError('[!] Error creating', constantName, ':', err.message);
        reject(err);
      });
  });
};
/*
 * initSiteState
 * Setup all constants
 */
exports.initSiteState = () => {
  let buildfns = []; // functions to check constants and compile create funcs if needed
  let fns = [];      // all create funcs
  let initializer = new constantsInitializer();

  Object.keys(initializer.initializers).map(key => {
    buildfns.push(
      constantsModel.getByName(key)
        .then(res => {
          if(! res) {
            logInfo(
              '[+]', key, 'not found. Creating...'
            )
            fns.push(createConstantPromise(...initializer.initializers[key]));
          } else {
            logInfo('[+]', key, 'already exists.');
          }
        })
        .catch(logError)
    )
  });

  const flattenResults = (resultMap) => new Promise((resolve) => {
    let flatResults = {};
    resultMap.forEach(result => flatResults[result[0]] = result[1]);
    resolve(flatResults);
  })

  return Promise.all(buildfns)
    .then(() => {
      let resultMap = Promise.all(fns)
        .then(flattenResults)
      Promise.all(
        initializer.postProcessors.map(fn => resultMap.then(fn))
      ).then(() => logInfo('[+] Server constants nominal. Running post setup.')
      ).then(initializer.postSetup
      ).then(() => logInfo('[+] Done.')
      ).catch(logError);
    }).catch(logError);
};
