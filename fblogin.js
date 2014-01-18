var express = require("express");
var app = express();
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: 568439769914767,
    clientSecret: ee31e9901829fc3f77867c0767417679,
    callbackURL: "http://http://thatsdeepman.heroku.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(..., function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/success',
                                      failureRedirect: '/login' }));

app.get('/', function(req,res) {
	res.send('<a href="/auth/facebook">Login with Facebook</a>');
});

app.get('/', function(req,res) {
	res.send("you're logged in with facebook!");
});

app.listen(80);
