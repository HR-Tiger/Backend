const passport = require('passport');
const passportJWT = require('passport-jwt');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const Users = require('../Models/users');

const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;

passport.use(
  new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret',
  },
  (jwtPayload, cb) => {
    // console.log('try', jwtPayload)
    return Users.findOneById(jwtPayload.user_id)
      .then((user) => {
        console.log('sss', jwtPayload.id);
        return cb(null, user);
      })
      .catch((err) => cb(err));
    }
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
    .catch((err) => cb(err));
  }),
);
