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

app.use(cors());
app.use(express.bodyParser());
app.use(app.router);

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
  console.log(req.query.lastID);
	var query_string = "select * from chats where ((fromID = " 
  + req.query.from + " and toID = " + req.query.to
  + ") or (fromID = " + req.query.to + " and toID = " + req.query.from + "))"
  + " and (id>" + req.query.lastID + ")";

  var query_string2 = "select * from chats";

	db.serialize(function() {
		db.all(query_string, function(err, rows) {
			if(err) {
				console.log(err);
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

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(3000);
