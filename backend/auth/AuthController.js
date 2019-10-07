const express = require('express');
const authRouter = express.Router();
const bodyParser = require('body-parser');
const User = require('../user/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const VerifyToken = require('./VerifyToken');

authRouter.use(bodyParser.urlencoded({
    extended: false
}));
authRouter.use(bodyParser.json());

authRouter.post(
  '/login',
  (req, res) => {
      console.log(req.body);
      User.findOne({
            name: req.body.name
        },
        (err, user) => {
            if (err) return res.status(500).send('Error on the server.');
            if (!user) return res.status(404).send('No user found.');

            // .compareSync() method compare the password sent with the request to the password in the database
            let passwordIsValid = bcrypt.compareSync(
              req.body.password,
              user.password
            );
            if (!passwordIsValid) return res.status(401).send({
                auth: false,
                token: null
            });

            let token = jwt.sign({
                  id: user._id
              },
              config.secret, {
                  expiresIn: 86400 // expires in 24 hours
              });

            res.status(200).send({
                auth: true,
                token: token,
                user:  {
                   id: user._id,
                    username: user.name
                }
            });
        });

  });

// use get on browser form load
authRouter.get(
  '/register',
  (req, res) => {
      console.log('/register GET: got data on server');
      res.set('Content-Type', "text/html");
      res.status(200).sendFile('/Users/maksim/Desktop/auth-todo/frontend/register.html');
  }
);
//create user in db and return auth & token to web
authRouter.post(
  '/register',
  (req, res) => {
      console.log('/register POST: data from server on web');
      res.set('Content-Type', "text/html");
      //we don't store user passwords but compute the hash and store the hash
      let hashedPassword = bcrypt.hashSync(req.body.password, 8);
      //store user name and hash using db facade of the model
      User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        },
        (err, data) => {
            if (err) return res.status(500).send("There was a problem registering the data.");
            // create a token
            let token = jwt.sign(
              {id: data._id},
              config.secret, {
                  expiresIn: 44200
              });
            res.status(200).send({
                token: token,
                name: data.name,
                email: data.email
            });
        })
  });
//return all users from db
authRouter.get(
  '/users',
  (req, res) => {
      User.find(
        {},
        (err, users) => {
            if (err) return res.status(500).send("There was a problem finding the users.");
            res.status(200).send(users);
        });
  });

//return one user
authRouter.get(
  '/users/:id',
  (req, res) => {
      User.findById(
        req.params.id,
        (err, user) => {
            if (err) return res
              .status(500)
              .send("There was a problem finding the user.");
            if (!user) return res
              .status(404).send("No user found.");
            res.status(200).send(user);
        });
  });

//remove one user
authRouter.delete(
  '/users/:id',
  (req, res) => {
      User.findByIdAndRemove(
        req.params.id,
        (err, user) => {
            if (err) return res
              .status(500)
              .send("There was a problem deleting the user.");
            res
              .status(200)
              .send("User: " + user.name + " was deleted.");
        });
  });

authRouter.get(
  'users/logout/:id',
  (req, res) => {
      res.status(200)
        .send({
            auth: false,
            token: null
        });
  });

authRouter.put(
  'users/:id',
  VerifyToken,
  (req, res) => {
      User.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true},
        (err, user) => {
            if (err) return res
              .status(500)
              .send("There was a problem updating the user.");
            res
              .status(200)
              .send(user);
        });
  });

module.exports = authRouter;
