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
	$scope.loadData = function() {
		$http.get("/api/processes").success(function(response) { $scope.processes = response; });
	}
	
	$scope.onRestart = function(process, server, pid, port) {
		$http.jsonp("http://" + server + ":" + port + "/api/action?callback=JSON_CALLBACK&type=restart&process=" + process + "&pid=" + pid).success(function(response) { $scope.loadData(); setTimeout(function() { $scope.loadData(); }, 100); }); }
	
	$scope.onStop = function(process, server, pid, port) {
		$http.jsonp("http://" + server + ":" + port + "/api/action?callback=JSON_CALLBACK&type=stop&process=" + process + "&pid=" + pid).success(function(response) { $scope.loadData(); });
	}
	
	$scope.onSpawn = function(process, server, port) {
		$http.jsonp("http://" + server + ":" + port + "/api/action?callback=JSON_CALLBACK&type=spawn&process=" + process).success(function(response) { setTimeout(function() { $scope.loadData(); }, 100); });
	}
	
	// Initial load
	$scope.loadData();
});
