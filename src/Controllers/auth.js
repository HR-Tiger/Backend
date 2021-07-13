const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const Users = require('../Models/users');

const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;

passport.use(
  new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret',
  },
  (jwtPayload, cb) => Users.findOneById(jwtPayload.id)
    .then((user) => cb(null, user))
    .catch((err) => cb(err)),
  )
);

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
}, (username, password, cb) => {
  Users.findOne(username)
    .then((user) => {
      if (!user) {
        return cb(null, false, {
          message: 'Incorrect email or password.',
        });
      } else {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err || !result) {
            return cb(null, false, {
              message: 'Incorrect email or password.',
            });
          } else if (result) {
            return cb(null, user, {
              message: 'Logged In Successfully',
            });
          }
        });
      }
    })
    .catch((err) => {
      return cb(err);
    });
  }),
);

const login = (req, res, next) => {
  // console.log('login');
  passport.authenticate(
    'local',
    {
      session: false,
    },
    (err, user, info) => {
      // console.log('login call');
      if (err || !user) {
        res.status(400).json({
          message: info ? info.message : 'Login failed',
          user: user,
        });
      } else {
        req.login(user, { session: false }, (error) => {
          if (error) {
            res.status(403).send(err);
          } else {
            const token = jwt.sign(user, 'secret');
            res.status(200).json({ user, token });
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
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            if (err) {
              res.sendStatus(500);
            }
            bcrypt.hash(password, salt, (error, hash) => {
              if (error) {
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
