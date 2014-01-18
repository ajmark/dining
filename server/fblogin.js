var express = require("express");
var app = express();
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: 676552805730069,
    clientSecret: 5c8d7826b50a1474c42d9d46ce30a4fd,
    callbackURL: "http://www.dinewithdinex.com/"
  },
  function(accessToken, refreshToken, profile, done) {
    //check user table for anyone with a facebook ID of profile.id
    //tim pls set up server and shit and put some SQL here
            User.findOne({
                'facebook.id': profile.id 
            }, function(err, user) {
                if (err) {
                    return done(err);
                }
                //No user was found... so create a new user with values from Facebook (all the profile. stuff)
                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        username: profile.username,
                        provider: 'facebook',
                        //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
                        facebook: profile._json
                    });
                    user.save(function(err) {
                        if (err) console.log(err);
                        return done(err, user);
                    });
                } else {
                    //found user. Return
                    return done(err, user);
                }
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
