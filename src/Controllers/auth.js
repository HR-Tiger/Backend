const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Users = require('../Models/users');

const login = (req, res) => {
  passport.authenticate(
    'local',
    {
      session: false,
    },
    (err, user, info) => {
      if (err || !user) {
        // console.log('auth.js', err, user);
        res.status(400).json({
          message: info ? info.message : 'Login failed',
          msg: err,
          user: user,
        });
      } else {
        req.login(user, { session: false }, (error) => {
          if (error) {
            res.status(403).send(err);
          } else {
            const token = jwt.sign(user, 'secret');
            res.status(200).json({
              token: token,
              user_id: user.user_id,
            });
          }
        });
      }
    },
  )(req, res);
};

const register = (req, res) => {
  const {
    username,
    email,
    password,
    firstName,
    lastName,
  } = req.body;

  if (username && password) {
    Users.checkEmailOrUsername([username, email])
      .then((data) => {
        if (data.rows.length > 0) {
          res.status(418).json({
            msg: 'Username or email exists',
          });
          return;
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            if (err) {
              console.log(err);
              res.sendStatus(500);
            }
            bcrypt.hash(password, salt, (error, hash) => {
              if (error) {
                console.log(err)
                res.sendStatus(500);
              }

              Users.createUser(
                email,
                username,
                hash,
                salt,
                firstName,
                lastName,
              )
                .then((data) => {
                  res.status(201).send(data);
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).send(err);
                });
            });
          });
        }
      })
      .catch((err) => res.status(500).json({
        msg: err,
      }));
  } else if (!username || !password) {
    res.sendStatus(422);
  } else {
    res.sendStatus(400);
  }
};

module.exports = {
  login,
  register,
};
