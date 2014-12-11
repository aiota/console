var express = require("express");
var cookieParser = require("cookie-parser");
var methodOverride = require("method-override");
var http = require("http");
var MongoClient = require("mongodb").MongoClient;
var config = require("./config");

var dbConnection = null;

var app = express();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(methodOverride());
app.use(express.static(__dirname + "/public"));

// GET requests
app.get("/", function(request, response) {
	response.render("index");
});

app.get("/processes", function(request, response) {
	dbConnection.collection("running_processes", function(err, collection) {
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

MongoClient.connect("mongodb://" + config.database.host + ":" + config.database.port + "/aiota", function(err, db) {
	if (err) {
		console.log(err);
	}
	else {
		dbConnection = db;
		http.createServer(app).listen(config.port);
	}
});
