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
var PriorityQueue = require('priorityqueuejs');

var passport = require('passport');

var http = require('http');
var https = require('https');

app.configure(function() {
  app.use(express.static('public'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'such doge very cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(__dirname + "/client"));
  app.use(app.router);
});

/********************************
******** Facebook login *********
********************************/

var FacebookStrategy = require('passport-facebook').Strategy;

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
		profile.accessToken = accessToken;
        return done(null, profile);
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
        res.redirect('/choose');
});

app.get('/', function(req,res) {
    res.send('<a href="/auth/facebook">Login with Facebook</a>');
});

app.get('/success', function(req,res) {
	console.log(req.user);
	console.log(req.user.id);
	db.get("SELECT id FROM fbuser WHERE fbid=" + req.user.id, function(err, row){
		req.session.userId = row.id;
	});
	req.session.accessToken = req.user.accessToken;
	res.send(req.user);
	res.redirect("/choose");
    // res.send("you're logged in with facebook!");
});

app.get('/fail', function(req,res) {
    res.send("you goddamn failure");
});


/******************************
******** end fb login *********
******************************/

/** get facebook friends */
app.get('/get_friends', function(req,res) {
	var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: '/me/friends' + '?access_token=' + req.user.accessToken,
        method: 'GET'
    };

    var buffer = ''; //this buffer will be populated with the chunks of the data received from facebook
    var request = https.get(options, function(result){
        result.setEncoding('utf8');
        result.on('data', function(chunk){
            buffer += chunk;
        });

    result.on('end', function(){
       	var friends = JSON.parse(buffer);
        var friendList = friends.data;

        //stringing together all friends' ids
        var ids = '(';
        for (i in friendList) {
        	ids += friendList[i].id + ",";
        }
        //for last comma
        ids = ids.substring(0,ids.length - 1) + ")";

		db.all("SELECT id\
			    FROM fbuser\
			    	INNER JOIN listing\
			    	ON fbuser.id=listing.user_id\
			    WHERE fbuser.fbid IN " + ids, function(err, rows){
			    //	console.log(rows);
			res.send(rows);
		});
        });
    });

    request.on('error', function(e){
        console.log('error from facebook.getFbData: ' + e.message)
    });

    request.end();
});

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
			 lat REAL,\
			 lng REAL,\
			 rate REAL,\
			 listing_type TEXT,\
			 status TEXT,\
			 msg TEXT,\
			 time_listed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\
			 buyer_id INTEGER,\
			 hash TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS fbuser\
            (id INTEGER,\
            fbid INTEGER)");
}

createDbTables();

//app.use(cors());

app.post("/api/add_listing", function(req, res){
	console.log(req.body);
	var location = req.body.location;
	var lat = req.body.lat;
	var lng = req.body.lng;
	var rate = req.body.rate;
	var listingType = req.body.listingType;
	var status = req.body.status;
	var userId = req.body.user_id; //this should be a real user id (like the one used in our database)
	var hash = md5(req.body.location + req.body.price + req.body.status + req.body.user_id);
	db.run("INSERT OR REPLACE INTO listing (user_id, location, lat, lng, rate, listing_type, status, msg, hash)\
			VALUES ($userId, $location, $lat, $lng, $rate, $listingType, $status, $msg, $hash)", 
			{
				$userId : req.session.userId,
				$location : location,
				$lat : lat,
				$lng : lng,
				$price : price,
				$listingType : listingType,
				$status : status,
				$msg : msg,
				$hash : hash
			});
	res.send({'hash' : hash});
});

app.get("/api/get_listings", function(req, res){
	var listingType = req.query.listingType;
	var lat = req.query.lat;
	var lng = req.query.lng;
	db.all("SELECT *\
			FROM listing\
			WHERE listing_type = $listingType\
			AND ABS(lat - $lat) < 0.01\
			AND ABS(lng - $lng) < 0.01",
			{
				$listingType : listingType,
				$lat : req.query.lat,
				$lng : req.query.lng
			}, function(err,rows){
				if (err){
					console.log(err);
				}
				else{
					res.send(rows);
				}
			});
});

// app.get("/api/get_listings", function(req, res){
// 	//lookup by hash, by recency or by ??? (who cares man tim forgot so I forgot too)
// 	if(req.query.by == "hash") {
// 		var query_string = "select * from listing where hash = \"" + req.query.hash + "\"";
// 		console.log(query_string);
// 		// db.get("select * from listing where hash = \"$hash\"", {$hash: req.query.hash});
// 		db.get(query_string, function(err,rows) {
// 			console.log(rows);
// 			res.send(rows);
// 		});
// 	}
// 	else if(req.query.by == "recent") {
// 		if(!req.query.until) {
// 			res.send("fauck u");
// 		}
// 		var query_string = "select * from listing where time_listed >= (select datetime('now','-" + req.query.until + " hours'))";
// 		db.serialize(function() {
// 			db.all(query_string, function(err, rows) {
// 				if(err) {
// 					console.log(err);
// 				}
// 				res.send(rows);
// 			});
// 		});
// 	}
// 	else {
// 		console.log("i don't know how to handle this");
// 		res.send(null);
// 	}
// 	// db.all("SELECT * FROM listing", function(err, rows){
// 	// 	res.send(rows);
// 	// });
// });

// app.get("/api/get_all_listings_ascending", function(req,res) {
// 	var pq = new PriorityQueue(function (a,b) {
// 		return a.price - b.price;
// 	});
// 	db.serialize(function () {
// 		db.each("select * from listing join fbuser on listing.id = fbuser.id", function(err, row) {
// 			if(err) {
// 				console.log(err);
// 			}
// 			pq.enq(row);
// 		}, function(err, rows) {
// 		res.send(pq);
// 	})})
// });

// To get chats between 2 people
// app.get('/api/get_chats', function(req,res) {
// 	var query_string = "SELECT * FROM chats WHERE ((fromID = " 
//   + req.query.from + " AND toID = " + req.query.to
//   + ") OR (fromID = " + req.query.to + " AND toID = " + req.query.from + "))"
//   + " AND (id>" + req.query.lastID + ")";

// 	db.serialize(function() {
// 		db.all(query_string, function(err, rows) {
// 			if(err) {
// 				console.log(err);
// 			}
// 			res.send(rows);
// 		});
// 	});
// });

app.get("/api/get_chats", function(req, res){
	var hash = req.query.hash;
	db.all("SELECT *\
			FROM listing\
				INNER JOIN chats\
				ON (chats.fromID = listing.user_id\
					AND chats.toId = listing.buyer_id)\
				OR (chats.fromID = listing.buyer_id\
					AND chats.toId = listing.user_id)\
			WHERE hash = $hash",
			{
				$hash : hash
			}, function(err, rows){
				if (err){
					console.log(err);
				}
				else{
					res.send(rows);
				}
			});
});


// To get all chats for debugging purposes
app.get('/api/get_all_chats', function(req,res) {
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
app.post('/api/send_message', function(req, res){
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





/** given coordinates, returns 30 nearby venues */
app.get('/api/get_coords', function(req,res) {
  if (!req.query.lat || !req.query.lon) res.send(400);

	request({
		uri: "https://api.foursquare.com/v2/venues/search?ll=" +
			req.query.lat + "," + req.query.lon + 
			"&client_id=YRIG5YIRMQIGEORGCNXDXCNDDTKHI2JZFGMTFQEKAWWOXWLD&client_secret=ILBQTJZYO2X11GUSOKXEHXDDOO2YXUPYQOZVRI2MHK0VMOQ5&v=20140101",
	  	method: "GET",
	  	timeout: 10000,
	  	followRedirect: true,
	  	maxRedirects: 10
	}, 
	
	function(error, response, body) {
		res.send(venueInformation(error,response,body));
	});
});

/** adds a search term to the venues queries */
app.get('/api/refine_search', function(req,res) {
  if (!req.query.lat || !req.query.lon || !req.query.term) res.send(400);

	request({
		uri: "https://api.foursquare.com/v2/venues/search?ll=" +
			req.query.lat + "," + req.query.lon + 
			"&client_id=YRIG5YIRMQIGEORGCNXDXCNDDTKHI2JZFGMTFQEKAWWOXWLD&client_secret=ILBQTJZYO2X11GUSOKXEHXDDOO2YXUPYQOZVRI2MHK0VMOQ5&v=20140101"
			+ "&query=" + req.query.term,
	  	method: "GET",
	  	timeout: 10000,
	  	followRedirect: true,
	  	maxRedirects: 10
	}, 
	
	function(error, response, body) {
		res.send(venueInformation(error,response,body));
	});
});


/** helper function for finding venues */
function venueInformation (error, response, body) {
	var searchObj = JSON.parse(body);
	var venues = searchObj.response.venues;
  var result = [];

	for (i in venues) {
    result.push({
      name: venues[i].name,
      id: venues[i].id,
      dist: venues[i].location.dist,
      addr: venues[i].location.address,
      checkCount: venues[i].stats.checkinsCount
    });
  }

  return result.sort(function(a,b){return b.checkCount - a.checkCount});
  //return venues;
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

// Venmo API
/* 
app.get('/venmo_payment', function (req, res) {
  'https://venmo.com/?txn=pay&recipients=username&amount=amount&note=note&audience=private'
})*/

app.get("/*", function(req, res){
    res.sendfile("client/index.html");
    
});

app.listen(3000);
