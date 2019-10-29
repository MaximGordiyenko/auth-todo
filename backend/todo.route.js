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
                        res.send(`<html>

<body>
<h3>Todos list empty</h3>
<a href="/add.html">[+] add todo</a>
</body>
                      </html>`);
                        return;
                    }
                    console.log('Todos list is not empty');
                    let todoListHtml = "<html> <body>";
                    todoListHtml += `
<h3>Actions:</h3>
<a href="/add.html">[+] add todo</a>
<h3>Current todos list:</h3>
<form action="/todos/delete/" method="get">
`;
                    todos.forEach(function (todo_value) {
                        const todo_item_form = `
    <span>text: ${todo_value.text} date: ${todo_value.create_data} completed: ${todo_value.completed}</span>
    <button type="submit"><a href="/todos/${userID}/${todo_value.id}/delete/">[-]kill</a></button>
                        `;
                        todoListHtml += todo_item_form;
                    });
                    todoListHtml += "</form> </html> </body>";
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
          console.log('req is: ', req.body);
          let body_json = req.body;
          console.log('request body is: ', body_json);
          let object = Todo.create({
              "text": null === body_json.todo? "dummy_empty": body_json.todo,
              "user_id": userID,
              "completed": false,
              "create_data": null === body_json.date? "dummy_date":body_json.date
          });
          object.then(function (todo_item) {
              console.log("todo created " + todo_item);
          });
          res.redirect('/');
      });
  });

todoRoutes.get(
  '/:user_id/:todo_id/delete',
  (req, res) => {
      console.log('working out /todos/:id delete');
      const userID = req.params.user_id;
      console.log("userid is " + userID); //check this
      if (null == userID || '' === userID) {
          res.status(401).json({err: 'user id not found'});
          return;
      }
      const todoID = req.params.todo_id;
      console.log('delete todo_id = ' + todoID);

      Todo.findByIdAndRemove(todoID, (err, todo) => {
          if (err) {
              res.status(404).send("data is not found");
              console.log("error '/todos/ delete :id': ", todo);
          }
          else {
              res.redirect('/');
          }
      });

  });

module.exports = todoRoutes;
