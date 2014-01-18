var express = require('express');
// var fs = require("fs");
var file = "test.db";
// var exists = fs.existsSync(file);
// var sql = require('sql'); //help this doesn't work I am sad
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);
var app = express();

// var chatlogs = sql.define({
// 	name: 'chats',
// 	columns: ['fromID', 'toID', 'msg', 'time']
// });

app.get('/get_chats', function(req,res) {
	// var bad_query_string = chatlogs
	// 					.select(chatlogs.msg, chatlogs.time)
	// 					.from(chatlogs)
	// 					.where(chatlogs.fromID.equals(req.query.from))
	// 					.toQuery();
	// console.log(bad_query_string.text);
	// var query = db.prepare("select * from chats where fromID = 1");
	var query_string = "select * from chats where fromID = " + req.query.from;

	db.serialize(function() {
		// if(!exists) {
		// 	db.run("create table chats (fromID NUMERIC, toID NUMERIC, msg TEXT, time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)");
		// }

		db.all(query_string, function(err, rows) {
			if(err) {
				console.log(err);
			}
			res.send(rows);
		});
	});
});

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(3000);
