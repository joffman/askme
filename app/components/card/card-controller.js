angular.module("card.controllers", [])
.controller("cardController", ["$scope", "$routeParams", function($scope, $routeParams) {

	// Data. todo: Get this from backend.
	$scope.card = {
		id: 2,
		title: "Second card",
		question: "When was C++ created?",
		answer: "1985"
	};

}]);
