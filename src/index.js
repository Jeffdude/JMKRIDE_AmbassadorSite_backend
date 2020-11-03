const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config.js');
const AuthRouter = require('./auth/routes.js');
const UsersRouter = require('./users/routes.js');


const app = express();

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Expose-Headers', 'Content-Length');
  res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  } else {
    return next();
  }
});

app.use(bodyParser.json());
AuthRouter.configRoutes(app);
UsersRouter.configRoutes(app);

app.get('/server-status', [
  (req, res) => res.status(200).send()
]);


app.listen(config.port, function () {
  console.log('AmbassadorSite-backend listening at port:', config.port);
});
