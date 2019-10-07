const express = require('express');
const bodyParser = require('body-parser');
const mainPageRouter = express.Router();

mainPageRouter.use(bodyParser.urlencoded({
    extended: false
}));
mainPageRouter.use(bodyParser.json());

mainPageRouter.get(
  '/',
  (req, res) => {
      res.set('Content-Type', "text/html");
      res.status(200).sendFile('/Users/maksim/Desktop/auth-todo/frontend/index.html');
  }
);

module.exports = mainPageRouter;