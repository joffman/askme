var askMeApp = angular.module("askMeApp", [ "ngRoute", "topiclist.controllers", "cardlist.controllers" ]);

// Configure routes.
askMeApp.config(function($routeProvider) {
	$routeProvider.when("/topics", {
		templateUrl: "app/components/topiclist/topiclist.html",
		controller: "topicListController"
	})
	.when("/topics/:topicId/cards", {
		templateUrl: "app/components/cardlist/cardlist.html",
		controller: "cardListController"
	})
	//.when("/topics/:topicId/cards/:cardId", {
	//	templateUrl: "app/components/card/card.html",
	//	controller: "cardController"
	//})
	.when("/about", {
		templateUrl: "app/components/about/about.html"
	})
	.otherwise({
		redirectTo: "/topics"
	});
});
