const express = require('express');
const todoRoutes = express.Router();
let Todo = require('./todo.model');
// const verifyToken = require('./auth/verifyToken');
let jwt = require('jsonwebtoken');
let config = require('../backend/config');

//return user id on success or empty string
function checkTokenAccess(token) {
    let userID = '';
    jwt.verify(
      token,
      config.secret,
      (err, decoded) => {
          if (err)
              return null;
          userID = decoded.id;
      });
    return userID;
}

todoRoutes.get(
  '/',
  (req, res) => {
      console.log("working on get /todos/")
      // check for basic auth header
      if (null === req.headers.authorization) {
          console.log('null Authorization object');
          return res.status(401).json({err: 'Missing Authorization Header'});
      }
      // verify auth credentials
      const token = req.headers.authorization;
      console.log("the token is ", token);
      let userID = checkTokenAccess(token);
      if ('' === userID) {
          res.status(401).json({err: 'user id not found'});
      } else {
          Todo.find(
            {user_id: userID},
            (err, todos) => {
                if (err) {
                    res.status(404).json({err: 'TODO not found'});
                    console.log(err);
                } else if (null === todos || todos.length === 0) {
                    console.log('Todos list is empty');
                    res.send(
                      `<html>

<body>
<h3>Todos list empty</h3>
<a href="/add.html">[+] add todo</a>
</body>
                      </html>`
                    );
                } else {
                    console.log('Todos list is not empty');
                    let todoListHtml = "<html> <body>";
                    todoListHtml += todos.toString();
                    todos.forEach(function (value) {
                       todoListHtml += "<p>" + value.toString() + "</p>";
                    });
                    todoListHtml += "</html> </body>";
                    res.send(todoListHtml);
                }
            });
      }
  });

todoRoutes.post(
  '/add',
  (req, res) => {
      console.log('working out /add');
      // check for basic auth header
      if (null === req.headers.authorization) {
          console.log('null Authorization object');
          return res.status(401).json({err: 'Missing Authorization Header'});
      }
      // verify auth credentials
      const token = req.headers.authorization;
      console.log("the token is ", token);
      // got no userid ??
      let userID = checkTokenAccess(token);
      console.log(userID); //check this
      if (null == userID || '' === userID) {
          console.log('/todos/add token got no user_id');
          res.status(401).json({err: 'user id not found'});
          return;
      }
      console.log('/todos/add userid = ' + userID);
      const body_json = req.body;
      res.json('Todos updated!');
      let object = Todo.create({ "text" : body_json.todo,
        "user_id" : userID,
        "completed" : false,
        "create_data" : body_json.date});
      console.log("todo created " + object.toString());
      res.status(200);
  });
/*
 todoRoutes.delete(
 '/:id',
 (req, res) => {
 let token = req.params.id;
 let userID = checkTokenAccess(token);
 if ('' === userID) {
 res.status(404);
 return;
 }
 console.log('Hei');
 Todo.findByIdAndRemove(
 req.params.id,
 (err, todo) => {
 if (err) {
 res.status(404).send("data is not found");
 console.log("error '/delete/:id': ", todo);
 } else {
 res.json('Successfully removed');
 }
 })
 }
 );*/

module.exports = todoRoutes;
