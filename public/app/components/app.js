var askMeApp = angular.module("askMeApp", [ "ngRoute", "ngResource",
		"attachments", "quiz", "categoryList", "collectionList",
		"collectionDetails", "cardList", "cardDetails" ]);

// Configure routes.
// TODO
//	- Use components instead.
//	- If possible, pass route-parameters as attributes to components.
askMeApp.config(function($routeProvider) {
	$routeProvider.when("/categories", {
		template: "<category-list></category-list>"
	})
	$routeProvider.when("/collections", {
		template: "<collection-list></collection-list>"
	})
	$routeProvider.when("/collections/:collectionId", {
		template: "<collection-details></collection-details>"
	})
	.when("/collections/:collectionId/cards", {
		template: "<card-list></card-list>"
	})
	.when("/collections/:collectionId/quiz", {
		template: "<quiz></quiz>"
	})
	.when("/collections/:collectionId/cards/:cardId", {
		template: "<card-details></card-details>"
	})
	.when("/collections/:collectionId/cards/:cardId/attachments", {
		template: "<attachments></attachments>"
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
