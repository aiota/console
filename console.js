var express = require("express");
var methodOverride = require("method-override");
var http = require("http");
var MongoClient = require("mongodb").MongoClient;
var config = require("./config");

var db = null;

function bodyParser(request, response, next)
{
	if (request._body) {
		next();
		return;
	}

	if (request.method == "POST") {
		response.setHeader("Access-Control-Allow-Origin", "*");
	}
	
	request.body = request.body || {};
	
	// Check Content-Type
	var str = request.headers["content-type"] || "";
	var contentType = str.split(';')[0];
  
  	if (contentType != "text/plain") {
		return next();
	}
	
	// Flag as parsed
	request._body = true;
	
	var buf = "";
	
	request.setEncoding("utf8");
	
	request.on("data", function (chunk) {
		buf += chunk
	});
	
	request.on("end", function () {	
		try {
			request.body = JSON.parse(buf);
			next();
		}
		catch (err) {
			err.body = buf;
			err.status = 400;
			next(err);
		}
	});
}

var app = module.exports = express();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(bodyParser);
app.use(methodOverride());
app.use(express.static(__dirname + "/public"));

// serve index and view partials
app.get("/", function(request, response) {
	response.render("index");
});

app.get("/partials/:name", function(request, response) {
	var name = request.params.name;
	response.render("partials/" + name);
});

app.get("/templates/:name", function(request, response) {
	var name = request.params.name;
	response.render("templates/" + name);
});

app.get("/api/processes", function(request, response) {
	db.collection("running_processes", function(err, collection) {
		if (err) {
			console.log(err);
			response.end("Unable to access AiotA database.");
			return;
		}
		
		var now = Date.now() - 20000;
		
		var processes = [];
		
		var stream = collection.find({ lastSync: { $gte: now } }).stream();
		
		stream.on("error", function (err) {
			console.log(err);
		});

		stream.on("data", function(doc) {
			processes.push(doc);
		});

		stream.on("end", function() {
			response.contentType("json");
			response.send(processes);
		});
	});
});

MongoClient.connect("mongodb://" + config.database.host + ":" + config.database.port + "/aiota", function(err, dbConnection) {
	if (err) {
		console.log(err);
	}
	else {
		db = dbConnection;
		http.createServer(app).listen(config.port);
	}
});
