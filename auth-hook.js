'use strict';

const { User, AuthenticationRequired } = require('unleash-server');

const passport = require('passport');
const headerStrategy = require('passport-http-header-strategy').Strategy;

passport.use(new headerStrategy(
  { header: "x-auth-request-user", passReqToCallback: true },
  (req, user, done) => {
    return done(
      null,
      new User({
        name: user,
        email: req.header('x-auth-request-email')
      })
    );
  }
));

const authenticate = passport.authenticate('header', { session: false });

function enableOauth2ProxyAuthentication(app) {
  app.use(passport.initialize());

  app.use('/api/admin', (req, res, next) => {
    authenticate(req, res, function (err) {
      if (err) {
        res
          .status('401')
          .json(
              new AuthenticationRequired({
                  type: 'custom',
                  message: `You have to identify yourself in order to use Unleash`,
              })
          )
          .end();
      }

      next();
    });
  });
}

module.exports = enableOauth2ProxyAuthentication;