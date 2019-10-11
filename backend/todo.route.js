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

todoRoutes.post(
  '/add/:id',
  (req, res) => {
      let token = req.params.id;
      let userID = checkTokenAccess(token);
      if ('' === userID) {
          res.status(404);
          return;
      }
      let todo = new Todo(req.body);
      todo.user_id = userID;
      todo.create_data = new Date().toLocaleDateString();
      todo.completed = false;
      todo.save()
        .then((todo) => {
            res.status(200).json(todo);
            console.log(todo);
        })
        .catch(err => {
            res.status(400).send('adding new todo failed');
            console.log('/add', err);
        });
  });

todoRoutes.get(
  '/',
  (req, res) => {
      console.log(req.get('authorization'));

      // check for basic auth header
      if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
          return res.status(401).json({ err: 'Missing Authorization Header' });
      }

      // verify auth credentials
      const token =  req.headers.authorization.split(' ')[1];
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
                } else if (null === todos) {
                    res.status(200);
                } else {
                    res.status(200).send(todos.toString());
                    // res.json(todos);
                }
            });
      }
  });

todoRoutes.put(
  '/:id',
  (req, res) => {
      let token = req.params.id;
      let userID = checkTokenAccess(token);
      if ('' === userID) {
          res.status(404);
          return;
      }
      Todo.findById(
        req.params.id,
        (err, todo) => {
            if (!todo) {
                res.status(404).send("data is not found");
            } else {
                todo.text = req.body.text;
                todo.user_id = req.body.user_id;
                todo.completed = req.body.completed;
                todo.create_data = req.body.create_data;
                todo.save()
                  .then(todo => {
                      res.json('Todos updated!');
                  })
                  .catch(err => {
                      res.status(400).send("Update not possible");
                  });
            }
        });
  });

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
);

module.exports = todoRoutes;