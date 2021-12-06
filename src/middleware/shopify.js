const crypto = require('crypto');

const { logError } = require('../modules/errors.js');
const { shopifyAppSecrets } = require('../environment.js');

exports.reformatBody = (formatObj) => (req, res, next) => {
  let rawBody = req.body;
  let newBody = {};
  for (const [key, getterFn] of Object.entries(formatObj)){
    newBody[key] = getterFn(rawBody);
  }
  req.body = newBody;
  next();
}

exports.validShopifyHmac = async (req, res, next) => {
  let requestHmac = req.get('X-Shopify-Hmac-Sha256');
  let requestStore = req.get('X-Shopify-Shop-Domain');
  let rawBody = req.rawBody;
  if(!shopifyAppSecrets || !shopifyAppSecrets[requestStore]) {
    let error = '[403][validShopifyHmac] Rejecting shopifyAPI request. No valid SHOPIFY_APP_SECRETS found.'
    logError(error)
    return res.status(403).send({error});
  }
  const generatedHmac = crypto.createHmac('sha256', shopifyAppSecrets[requestStore]).update(rawBody).digest('base64');
  if(generatedHmac !== requestHmac) {
    let error = '[403][validShopifyHmac] Unable to verify Shopify HMAC. X-Shopify-Hmac-Sha256: ' + requestHmac;
    logError(error)
    logError('[403][validShopifyHmac] ' + JSON.stringify({shopifyAppSecrets, requestHmac, generatedHmac}));
    return res.status(403).send({error});
  }
  next();
}