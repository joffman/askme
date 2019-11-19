angular.module("cardlist.controllers", ["cardlist.services"])
.controller("cardListController", ["$scope", "$location", "$routeParams", "cardlistSvc",
		function($scope, $location, $routeParams, cardlistSvc) {

	//////////////////////////////////////////////////
	// Scope variables.
	//////////////////////////////////////////////////

	$scope.collection_id = $routeParams.collection_id;
	$scope.collection_name = $scope.collection_id;	// todo: get name from backend
	$scope.cards = [];


	//////////////////////////////////////////////////
	// General functions.
	//////////////////////////////////////////////////

	function handleApiError(err) {
		alert("Error: " + err.message);
	}

	function fetchCards() {
		cardlistSvc.queryCards($routeParams.collection_id).then(function(resp_data) {
			$scope.cards = resp_data.cards;
		})
		["catch"](function(error) {
			handleApiError(error);
		});
	}

	function init() {
		fetchCards();
	}

	//////////////////////////////////////////////////
	// Scope functions.
	//////////////////////////////////////////////////

	$scope.remove = function(card_id) {
		cardlistSvc.removeCard(card_id).then(function(resp_data) {
			fetchCards();
		})
		["catch"](function(error) {
			handleApiError(error);
		});
	};

	$scope.onAddCardClicked = function() {
		$location.url(`/collections/${$routeParams.collection_id}/cards/0`);
	};

	$scope.startQuiz = function() {
		$location.url(`/collections/${$routeParams.collection_id}/quiz`);
	};


	//////////////////////////////////////////////////
	// Initialization.
	//////////////////////////////////////////////////

	init();

}]);
