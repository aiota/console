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
});
