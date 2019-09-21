var askMeApp = angular.module("askMeApp", [ "ngRoute", "ngResource", "topiclist.controllers", "cardlist.controllers", "card.controllers" ]);

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
	.when("/topics/:topicId/cards/:cardId", {
		templateUrl: "app/components/card/card.html",
		controller: "cardController"
	})
	.when("/about", {
		templateUrl: "app/components/about/about.html"
	})
	.otherwise({
		redirectTo: "/topics"
	});
});

askMeApp.controller("headerNavCtrl", function($scope) {
	
	$scope.onNavItemClick = function($event) {
		var elem = angular.element($event.target);

		// Unselect all navigation-items.
		var ul = elem.parents("ul");
		ul.find("li > a").removeClass("active");

		// Select the clicked item. 
		elem.addClass("active");
	};

});
