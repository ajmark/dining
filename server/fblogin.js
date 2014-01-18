var express = require("express");
var file = "test.db";
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);
var app = express();
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

app.configure(function() {
  app.use(express.static('public'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

//blame tim for this; creates fb user entry table
function createDbTables() {
	db.run("CREATE TABLE IF NOT EXISTS fbuser\
		    (id INTEGER,\
		    fbid INTEGER)");
}
createDbTables();

// serialize and deserialize
passport.serializeUser(function(user, done) {
done(null, user);
});
passport.deserializeUser(function(obj, done) {
done(null, obj);
});

passport.use(new FacebookStrategy({
    clientID: '676552805730069',
    clientSecret: '5c8d7826b50a1474c42d9d46ce30a4fd',
    callbackURL: "http://localhost:12000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    //check user table for anyone with a facebook ID of profile.id
    //tim pls set up server and shit and put some SQL here
            // User.findOne({
            //     'facebook.id': profile.id 
            // }, function(err, user) {
            //     if (err) {
            //         return done(err);
            //     }
            //     //No user was found... so create a new user with values from Facebook (all the profile. stuff)
            //     if (!user) {
            //         user = new User({
            //             name: profile.displayName,
            //             email: profile.emails[0].value,
            //             username: profile.username,
            //             provider: 'facebook',
            //             //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
            //             facebook: profile._json
            //         });
            //         user.save(function(err) {
            //             if (err) console.log(err);
            //             return done(err, user);
            //         });
            //     } else {
            //         //found user. Return
            //         return done(err, user);
            //     }
            console.log(profile);
            //this is a very bad order to do it in. blame tim.
        	var query_string = "select id from fbuser where fbid = " + profile.id;
        	db.serialize(function() {
        		db.get(query_string, function(err, rows) {
        			if(err) {
        				console.log(err);
        			}
        			if(!rows) { //user is registering
        				var qs = "insert into user\
        					    (name)\
        					    values (" + "\"" + profile.displayName + "\")";
        				console.log(qs);
        				db.run(qs);
        				db.get("select last_insert_rowid()", function(err, rows) {
        					if(err) {
        						console.log(err);
        					}
        					console.log(rows['last_insert_rowid()']);
        					var qs = "insert into fbuser\
        						    values ("+ rows['last_insert_rowid()'] + "," + profile.id + ")";
        					console.log(qs);
        					db.run(qs);
        				});
        			}
        		})
        	});
            return done(null, profile.displayName);
            })
    );

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback',
	passport.authenticate('facebook', {failureRedirect: '/fail', successRedirect: '/success'}),
	function(req, res) {
		console.log("great success!");
 		res.redirect('/success');
});

app.get('/', function(req,res) {
	res.send('<a href="/auth/facebook">Login with Facebook</a>');
});

app.get('/success', function(req,res) {
	res.send("you're logged in with facebook!");
});

app.get('/fail', function(req,res) {
	res.send("you goddamn failure");
});

app.listen(12000);
