var express = require('express');
var file = "test.db";
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);
var app = express();

var http = require('http');
app.get('/get_coords', function(req,res) {

	var lon = req.query.lon
	var lat = req.query.lat

	var options = {
  		host: 'api.foursquare.com',
  		path: 'v2/venues/search?ll=' + lon + "," + lat + '&client_id=YRIG5YIRMQIGEORGCNXDXCNDDTKHI2JZFGMTFQEKAWWOXWLD&client_secret=ILBQTJZYO2X11GUSOKXEHXDDOO2YXUPYQOZVRI2MHK0VMOQ5&v=20140101'
	}
});

var httpProxy = require("http-proxy");
var options = {
                hostnameOnly : true,
                router: {
                            "www.dinewithdinex.com" : "127.0.0.1:8000",
                            "dinewithdinex.com" : "127.0.0.1:8000",
                            "api.dinewithdinex.com" : "127.0.0.1:3000"
                }
            }



app.get('/get_chats', function(req,res) {
	var query_string = "select * from chats where fromID = " + req.query.from;

	db.serialize(function() {

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
var proxyServer = httpProxy.createServer(options);
proxyServer.listen(80);
