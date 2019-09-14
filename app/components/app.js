var askMeApp = angular.module("askMeApp", [ "ngRoute", "topiclist.controllers", "topicform.controllers" ]);

// Configure routes.
askMeApp.config(function($routeProvider) {
	$routeProvider.when("/topics", {
		templateUrl: "app/components/topiclist/topiclist.html",
		controller: "topicListController"
	})
	.when("/topics/:topicId", {
		templateUrl: "app/components/topicform/topicform.html",
		controller: "topicFormController"
	})
	.when("/about", {
		templateUrl: "app/components/about/about.html"
	})
});
