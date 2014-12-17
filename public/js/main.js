var app = angular.module("aiotaConsole", [ "ngRoute" ]);

// Configure the routes
app.config([ "$routeProvider", function($routeProvider) {
  $routeProvider
  	// Pages
	.when("/", { templateUrl: "partials/home", controller: "processController" })
	.when("/about", { templateUrl: "partials/about", controller: "pageController" })
	.when("/services", { templateUrl: "partials/services", controller: "pageController" })
    // else 404
    .otherwise("/404", { templateUrl: "partials/404", controller: "pageController" });
}]);

app.controller("pageController", function (/* $scope, $location, $http */) {
});

app.controller("processController", function ($scope, $http) {
	$http.get("/api/processes").success(function(response) { $scope.processes = response; });
	
	$scope.onRestart = function(pid) {
		$http.jsonp("http://localhost:8081/api/action?callback=JSON_CALLBACK&type=restart&pid=" + pid).success(function(response) { alert(JSON.stringify(response)); });
	}
	
	$scope.onKill = function(pid) {
		alert("Kill: " + pid);
	}
	
	$scope.onStop = function(pid) {
		alert("Stop: " + pid);
	}
	
	$scope.onSpawn = function(process, server) {
		alert("Spawn: " + process + ", " + server);
	}
});
