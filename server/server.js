var express = require('express');
var cors = require('cors');
var file = "test.db";
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);
var app = express();
var request = require('request');
var md5 = require('MD5');
var api_key = 'key-1mj5tl1vgic26dvad2iruu9uun5vmq66';
var domain = 'sandbox87220.mailgun.org';
var mailgun = require('mailgun-js')(api_key, domain);

var passport = require('passport');

app.configure(function() {
  app.use(express.static('public'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

/********************************
******** Facebook login *********
********************************/

var FacebookStrategy = require('passport-facebook').Strategy;
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
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    //check user table for anyone with a facebook ID of profile.id
    //tim pls set up server and shit and put some SQL here
        // console.log(profile);
        //this is a very bad order to do it in. blame tim.
        var query_string = "select id from fbuser where fbid = " + profile.id;
        db.serialize(function() {
            db.get(query_string, function(err, rows) {
                if(err) {
                    console.log(err);
                }
                if(!rows) { //user is registering
                    // console.log(profile.emails[0]);
                    var qs = "insert into user\
                            (name,email)\
                            values (" + "\"" + profile.displayName + "\",\"" + profile.emails[0].value + "\")";
                    // console.log(qs);
                    db.run(qs);
                    db.get("select last_insert_rowid()", function(err, rows) {
                        if(err) {
                            console.log(err);
                        }
                        // console.log(rows['last_insert_rowid()']);
                        var qs = "insert into fbuser\
                                values ("+ rows['last_insert_rowid()'] + "," + profile.id + ")";
                        // console.log(qs);
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
app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

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
	req.session.test = "hello";
    res.send("you're logged in with facebook!");

});

app.get('/fail', function(req,res) {
    res.send("you goddamn failure");
});


/******************************
******** end fb login *********
******************************/

/* noob tim creating SQL tables */
function createDbTables(){
	db.run("CREATE TABLE IF NOT EXISTS user\
			(id INTEGER PRIMARY KEY AUTOINCREMENT,\
			 name TEXT,\
			 email TEXT,\
			 phone INTEGER)");
	db.run("CREATE TABLE IF NOT EXISTS chats\
			(id INTEGER PRIMARY KEY AUTOINCREMENT,\
			fromID INTEGER,\
			toID INTEGER,\
			msg TEXT,\
			time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)");
	db.run("CREATE TABLE IF NOT EXISTS listing\
			(user_id INTEGER PRIMARY KEY,\
			 location TEXT,\
			 price TEXT,\
			 status TEXT,\
			 time_listed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\
			 hash TEXT)");
}

createDbTables();

app.use(express.json());
app.use(cors());

app.post("/add_listing", function(req, res){
	console.log(req.body);
	var location = req.body.location;
	var price = req.body.price;
	var status = req.body.status;
	var userId = req.body.user_id;
	var hash = md5(req.body); //doesn't hash timestamp; idk if this is desirable behaviour or not
	db.run("INSERT OR REPLACE INTO listing (user_id, location, price, status, hash)\
			VALUES ($userId, $location, $price, $status, $hash)", 
			{
				$userId : userId,
				$location : location,
				$price : price,
				$status : status,
				$hash : hash
			});
	res.send({"status" : "success", 'hash' : hash});
});

app.get("/get_listings", function(req, res){
	//lookup by hash, by recency or by ??? (who cares man tim forgot so I forgot too)
	if(req.query.by == "hash") {
		var query_string = "select * from listing where hash = \"" + req.query.hash + "\"";
		console.log(query_string);
		// db.get("select * from listing where hash = \"$hash\"", {$hash: req.query.hash});
		db.get(query_string, function(err,rows) {
			console.log(rows);
			res.send(rows);
		});
	}
	else {
		console.log("i don't know how to handle this");
		res.send(null);
	}
	// db.all("SELECT * FROM listing", function(err, rows){
	// 	res.send(rows);
	// });
});

// To get chats between 2 people
app.get('/get_chats', function(req,res) {
	var query_string = "SELECT * FROM chats WHERE ((fromID = " 
  + req.query.from + " AND toID = " + req.query.to
  + ") OR (fromID = " + req.query.to + " AND toID = " + req.query.from + "))"
  + " AND (id>" + req.query.lastID + ")";

	db.serialize(function() {
		db.all(query_string, function(err, rows) {
			if(err) {
				console.log(err);
			}
			res.send(rows);
		});
	});
});

// To get all chats for debugging purposes
app.get('/get_all_chats', function(req,res) {
  var query_string = "SELECT * FROM chats ";

  db.serialize(function() {
    db.all(query_string, function(err, rows) {
      if(err) {
        console.log(err);
      }
      res.send(rows);
    });
  });
});

// To update chat when a user sends a message
app.post('/send_message', function(req, res){
  var query_string = "INSERT INTO chats (fromID, toID, msg) values (" 
    + req.body.from + ", " + req.body.to + ", '" + req.body.msg + "')";

  db.serialize(function(){
    db.all(query_string, function(err, rows) {
      if (err){
      }
      res.send(rows);
    });
  });
});

var http = require('http');
// app.get('/get_coords', function(req,res) {
// 	console.log(req.query.lon);
// 	console.log(req.query.lat);

// 	var options = {
// //  		host: 'api.foursquare.com',
//   //		path: '/v2/venues/search?ll=' + 
//   		host: "dinewithdinex.com:3000",
//   		path: "/"
// //  		req.query.lon + "," + req.query.lat + '&client_id=YRIG5YIRMQIGEORGCNXDXCNDDTKHI2JZFGMTFQEKAWWOXWLD&client_secret=ILBQTJZYO2X11GUSOKXEHXDDOO2YXUPYQOZVRI2MHK0VMOQ5&v=20140101'
// 	};

// callback = function(response) {
//   var str = '';

//   //another chunk of data has been recieved, so append it to `str`
//   response.on('data', function (chunk) {
//     str += chunk;
//   });

//   //the whole response has been recieved, so we just print it out here
//   response.on('end', function () {
//   	res.send("something below");
//     res.send(str);
//     res.send('hello');
//     console.log(str);
//     console.log("printed above");
//   //  JSON.parse(str);
//   });
// }

// http.request(options, callback).end();

// });

/** given coordinates, returns 30 nearby venues*/
app.get('/get_coords', function(req,res) {
	request({
		uri: "https://api.foursquare.com/v2/venues/search?ll=" +
			req.query.lon + "," + req.query.lat + 
			"&client_id=YRIG5YIRMQIGEORGCNXDXCNDDTKHI2JZFGMTFQEKAWWOXWLD&client_secret=ILBQTJZYO2X11GUSOKXEHXDDOO2YXUPYQOZVRI2MHK0VMOQ5&v=20140101",
	  	method: "GET",
	  	timeout: 10000,
	  	followRedirect: true,
	  	maxRedirects: 10
	}, 
	
	function(error, response, body) {
		venueInformation(error,response,body);
	});
});

/** adds a search term to the venues queries */
app.get('/refine_search', function(req,res) {
	request({
		uri: "https://api.foursquare.com/v2/venues/search?ll=" +
			req.query.lon + "," + req.query.lat + 
			"&client_id=YRIG5YIRMQIGEORGCNXDXCNDDTKHI2JZFGMTFQEKAWWOXWLD&client_secret=ILBQTJZYO2X11GUSOKXEHXDDOO2YXUPYQOZVRI2MHK0VMOQ5&v=20140101"
			+ "&query=" + req.query.term,
	  	method: "GET",
	  	timeout: 10000,
	  	followRedirect: true,
	  	maxRedirects: 10
	}, 
	
	function(error, response, body) {
		venueInformation(error,response,body);
	});
});

function venueInformation (error, response, body) {
	var searchObj = JSON.parse(body);
	var venues = searchObj.response.venues;

	for (index in venues) {
		console.log("Venue Name: " + venues[index].name);
		console.log("Venue ID: " + venues[index].id);
		console.log("Lat: " + venues[index].location.lat);
		console.log("Long: " + venues[index].location.lng);
  	}
}


// SMS things
app.get('/match_made_SMS', function (req,res) {
  request.post(
    'http://textbelt.com/text',
    {
      form: { number: req.query.number, message: "A match has been found for you!!! \
        Visit the app to find out who you're matched with! :)"}
    },
	function(error, response, body) {
		console.log(body);
		console.log("something");
	});
  // console.log(res);
});

// Email things
app.get('/match_made_email', function (req,res) {
  var data = {
  from: 'Me <no_reply@dinewithdinex.com>',
  to: req.query.email,
  // maybe can include bcc in the future but we are too lazy now
  subject: 'Found a match!',
  text: 'A match has been found for you!!! \
        Visit the app to find out who you\'re matched with! :)'
  };

  mailgun.messages.send(data, function (error, response, body) {
    console.log(body);
  });
});

app.listen(3000);
