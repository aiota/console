var aiota = require("aiota-utils");
var express = require("express");
var methodOverride = require("method-override");
var path = require("path");
var http = require("http");
var MongoClient = require("mongodb").MongoClient;
var config = null;
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
		
		var processes = [];
		
		var stream = collection.find({}).stream();
		
		stream.on("error", function (err) {
			console.log(err);
		});

		stream.on("data", function(doc) {
			doc["controllerPort"] = config.ports["aiota-controller"];
			processes.push(doc);
		});

		stream.on("end", function() {
			response.contentType("json");
			response.send(processes);
		});
	});
});

var args = process.argv.slice(2);
 
MongoClient.connect("mongodb://" + args[0] + ":" + args[1] + "/" + args[2], function(err, dbConnection) {
	if (err) {
		aiota.log(path.basename(__filename), "", null, err);
	}
	else {
		db = dbConnection;

		aiota.getConfig(db, function(c) {
			if (c == null) {
				aiota.log(path.basename(__filename), "", db, "Error getting config from database");
			}
			else {
				config = c;

				http.createServer(app).listen(config.ports["aiota-console"]);
			
				setInterval(function() { aiota.heartbeat(path.basename(__filename), config.server, db); }, 10000);
		
				process.on("SIGTERM", function() {
					aiota.terminateProcess(path.basename(__filename), config.server, db, function() {
						process.exit(1);
					});
				});
			}
		});
	}
});
