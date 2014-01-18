var express = require('express');
var cors = require('cors');
var file = "test.db";
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);
var app = express();
var request = require("request");
var md5 = require('MD5');

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
app.use(express.bodyParser());
app.use(app.router);

app.post("/add_listing", function(req, res){
	console.log(req.body);
	var location = req.body.location;
	var price = req.body.price;
	var status = req.body.status;
	var userId = req.body.user_id;
	var hash = "ABCD";
	db.run("INSERT OR REPLACE INTO listing (user_id, location, price, status, hash)\
			VALUES ($userId, $location, $price, $status, $hash)", 
			{
				$userId : userId,
				$location : location,
				$price : price,
				$status : status,
				$hash : hash
			});
	res.send({"status" : "success"});
});

app.get("/get_listings", function(req, res){
	db.all("SELECT * FROM listing", function(err, rows){
		res.send(rows);
	});
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

app.get('/hi', function (req,res) {
	request({
		uri: "http://textbelt.com/text",
		number: 3016421494,
		message: "oh heyyy",
	  	method: "POST",
	  	timeout: 10000,
	  	followRedirect: true,
	  	maxRedirects: 10
	}, 
	function(error, response,body) {
		console.log(response);
		console.log("something");
	});
});

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(3000);
