'use strict';

const { User, AuthenticationRequired } = require('unleash-server');

const passport = require('passport');
const CookieStrategy = require('passport-cookie').Strategy;

passport.use(new CookieStrategy(
  { cookieName: "_oauth2_proxy" }, 
  (token, done) => {
    if (!token || token.indexOf('|') == -1) {
      // Should never get here, because non-authenticated users or users with broken cookies should
      // never pass the oauth2-proxy service
      return done(Error("Invalid _oauth2_proxy cookie"), null);
    }
    var userInfoJson = Buffer.from(token.split('|')[0], 'base64').toString('utf-8'); // f.e. {"Email":"pavel.titenkov@gmail.com","User":"titenkov"}
    var userInfo = JSON.parse(userInfoJson);
    if (token) {
      return done(
        null,
        new User({
          name: userInfo.User,
          email: userInfo.Email
        })
      );
    }
    return done(Error("No _oauth2_proxy cookie found in request"), null);
  }
));

const authenticate = passport.authenticate('cookie', { session: false });

function enableOauth2ProxyAuthentication(app) {
  app.use(passport.initialize());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

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