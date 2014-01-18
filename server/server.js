var express = require('express');
var file = "test.db";
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);
var app = express();

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
}

createDbTables();

app.use(express.json());

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
  console.log("test");
  // req.body.whatever
  var query_string2 = "INSERT INTO chats (fromID, toID, msg) values (" 
    + req.body.from + ", " + req.body.to + ", " + req.body.msg + ")";

  console.log(req.body.msg);

  
  var query_string = "INSERT INTO chats(msg) VALUES(" + req.body.msg + ")";


  db.serialize(function(){
    // console.log("1");
    db.all(query_string, function(err, rows) {
      if (err){
        console.log(err);
      }
      // console.log("2");
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
