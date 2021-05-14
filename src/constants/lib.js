const { logInfo, logError } = require('../modules/errors.js');

const constantsModel = require('./model.js');
const constantsInitializer = require('./initializer.js');


/*
 * Setup all constants for Ambassador Server
 *
 * Returns: resultMap (thenable)
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
            fns.push(initializer.initializers[key]());
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
      ).then(initializer.postSetup
      ).then(() => {
        logInfo('[+] Server constants nominal.')
      }).catch(logError);
    }).catch(logError);
};
