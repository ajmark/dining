var express = require('express');
var fs = require("fs");
var file = "test.db";
var exists = fs.existsSync(file);
var sql = require('sql');
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database(file);
var app = express();

var chatlogs = sql.define({
	name: 'chats',
	columns: [from, to, msg, time]
});

app.get('/get_chats', function(req,res) {
	var query_string = chatlogs
						.select(chatlogs.msg, chatlogs.time)
						.from(chatlogs)
						.where(user.from.equals(req.query.from))
						.toQuery();

	db.serialize(function() {
		if(!exists) {
			db.run("create table chats (from TEXT, to TEXT, msg TEXT, time DATETIME DEFAULT CURRENT_TIMESTAMP");
		}
		var query = db.prepare(query_string);
	})
});

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(3000);
