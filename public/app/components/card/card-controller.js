angular.module("card.controllers", ["card.services"])
.controller("cardController", ["$scope", "$routeParams", "cardSvc",
		function($scope, $routeParams, cardSvc) {

	if ($routeParams.cardId == 0) {	// new card
		$scope.card = {
			id: 0
		};
	} else {						// existing card
		// Data. todo: Get this from backend.
		$scope.card = {
			id: 2,
			title: "Second card",
			question: "When was C++ created?",
			answer: "1985"
		};
	}

	$scope.onSubmit = function() {
		cardSvc.addCard($scope.card);
	};

}]);
