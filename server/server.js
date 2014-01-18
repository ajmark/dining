var express = require('express');
var file = "test.db";
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);
var app = express();


create table chats (fromID NUMERIC, toID NUMERIC, msg TEXT, time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL);
INSERT INTO chats (fromID, toID, msg) values (1,2,"hi there");
INSERT INTO chats (fromID, toID, msg) values (2,1,"hello there");
INSERT INTO chats (fromID, toID, msg) values (2,2,"I'm talking to myself wow");

// To get chats between 2 people
app.get('/get_chats', function(req,res) {
	var query_string = "select * from chats where (fromID = " 
  + req.query.from + " and toID = " + req.query.to
  + ") or (fromID = " + req.query.to + " and toID = " + req.query.from + ")";

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
app.get('/get_coords', function(req,res) {

	var lon = req.query.lon;
	var lat = req.query.lat;

	var options = {
  		host: 'api.foursquare.com',
  		path: 'v2/venues/search?ll=' + lon + "," + lat + '&client_id=YRIG5YIRMQIGEORGCNXDXCNDDTKHI2JZFGMTFQEKAWWOXWLD&client_secret=ILBQTJZYO2X11GUSOKXEHXDDOO2YXUPYQOZVRI2MHK0VMOQ5&v=20140101'
	};
});

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(3000);
