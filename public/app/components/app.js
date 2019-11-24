var askMeApp = angular.module("askMeApp", [ "ngRoute", "ngResource", "categories.controllers",
		"collections.controllers", "cardlist.controllers", "card.controllers",
		"attachments.controllers", "quiz.controllers", "collectionDetails" ]);

// Configure routes.
// TODO Use components instead.
askMeApp.config(function($routeProvider) {
	$routeProvider.when("/categories", {
		templateUrl: "app/components/categories/categories.html",
		controller: "categoriesController"
	})
	$routeProvider.when("/collections", {
		templateUrl: "app/components/collection-list/collection-list.template.html",
		controller: "collectionsController"
	})
	$routeProvider.when("/collections/:collectionId", {
		template: "<collection-details></collection-details>"
	})
	.when("/collections/:collection_id/cards", {
		templateUrl: "app/components/cardlist/cardlist.html",
		controller: "cardListController"
	})
	.when("/collections/:collection_id/quiz", {
		templateUrl: "app/components/quiz/quiz.html",
		controller: "quizController"
	})
	.when("/collections/:collection_id/cards/:card_id", {
		templateUrl: "app/components/card/card.html",
		controller: "cardController"
	})
	.when("/collections/:collection_id/cards/:card_id/attachments", {
		templateUrl: "app/components/attachments/attachments.html",
		controller: "attachmentsController"
	})
	.when("/about", {
		templateUrl: "app/components/about/about.html"
	})
	.otherwise({
		redirectTo: "/collections"
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
