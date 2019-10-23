const express = require('express');
const todoRoutes = express.Router();
let Todo = require('./todo.model');
// const verifyToken = require('./auth/verifyToken');
let jwt = require('jsonwebtoken');
let config = require('../backend/config');

//call_on_id(userID) is called when token is okay and provides valid userID,
//call_on_id(null) otherwise.
function on_userid_action(token, call_on_id) {
    jwt.verify(
      token,
      config.secret,
      (err, decoded) => {
          if (err)
              //token invalid
              call_on_id(null);
          else
              //token is valid - callback with userID string.
              call_on_id(decoded.id)
      });
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
      on_userid_action(token, function (userID) {
          if (null === userID) {
              res.status(401).json({err: 'user id not found'});
              return;
          }
          Todo.find({user_id: userID},
                (err, todos) => {
                    if (err) {
                        res.status(404).json({err: 'TODO not found'});
                        console.log(err);
                        return;
                    }
                    if (null === todos || todos.length === 0) {
                        console.log('Todos list is empty');
                        res.send(
                          `<html>

<body>
<h3>Todos list empty</h3>
<a href="/add.html">[+] add todo</a>
</body>
                      </html>`
                        );
                        return;
                    }
                    console.log('Todos list is not empty');
                    let todoListHtml = "<html> <body>";
                    todoListHtml += todos.toString();
                    todos.forEach(function (value) {
                        todoListHtml += "<p>" + value.toString() + "</p>";
                    });
                    todoListHtml += "</html> </body>";
                    res.send(todoListHtml);
                });
        });
  });

todoRoutes.post(
  '/add',
  (req, res) => {
      console.log('working out /add');
      const token = req.headers.authorization;
      // check for basic auth header
      if (null === token || '' === token) {
          console.log('null Authorization object');
          return res.status(401).json({err: 'Missing Authorization Header'});
      }
      // verify auth credentials
      console.log("the token is ", token);
      on_userid_action(token, function (userID) {
          console.log("id is " + userID); //check this
          if (null == userID || '' === userID) {
              console.log('/todos/add token got no user_id');
              res.status(401).json({err: 'user id not found'});
              return;
          }
          console.log('/todos/add userid = ' + userID);
          const body_json = req.body;
          res.json('Todos updated!');
          let object = Todo.create({
              "text": body_json.todo,
              "user_id": userID,
              "completed": false,
              "create_data": body_json.date
          });
          object.then(function (todo_item) {
              console.log("todo created " + todo_item);
          });
          res.status(200);
      });
  });
/*
 todoRoutes.delete(
 '/:id',
 (req, res) => {
 let token = req.params.id;
 let userID = on_userid_action(token);
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
