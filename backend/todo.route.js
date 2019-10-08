const express = require('express');
const todoRoutes = express.Router();
let Todo = require('./todo.model');
const verifyToken = require('./auth/verifyToken');
let jwt = require('jsonwebtoken');
let config = require('../backend/config');

todoRoutes.post(
  '/add',
  (req, res) => {
      let todo = new Todo(req.body);
      todo.save()
        .then(todo => {
            res.status(200).json({'todo': 'todo added successfully'});
            console.log(todo);
        })
        .catch(err => {
            res.status(400).send('adding new todo failed');
            console.log('/add', err);
        });
  });

todoRoutes.get(
  '/:id',
  (req, res) => {
      let token = req.params.id;
      let userID = '';
      jwt.verify(
        token,
        config.secret,
        (err, decoded) => {
            if (err)
                return res.status(500).send({
                    auth: false,
                    message: 'Failed to authenticate token.'
                });

            // if everything good, save to request for use in other routes
            userID = decoded.id;
        });
      Todo.findById(
        userID,
        (err, todos) => {
            if (err) {
                console.log(err);
            } else {
                res.json(todos);
            }
        });
  });

// todoRoutes.get(
//   '/:id',
//   (req, res) => {
//       let id = req.params.id;
//       Todo.findById(
//         id,
//         (err, todo) => {
//             res.json(todo);
//         });
//   });

todoRoutes.put(
  '/:id',
  (req, res) => {
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
      console.log('Hei');
      Todo.findByIdAndRemove(
        req.params.id,
        (err, todo) => {
            if (err) {
                res.status(404).send("data is not found");
                console.log("error '/delete/:id': ", todo);
            }else{
                res.json('Successfully removed');
            }
        })
  }
);

module.exports = todoRoutes;