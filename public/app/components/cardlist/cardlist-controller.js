angular.module("cardlist.controllers", ["cardlist.services"])
.controller("cardListController", ["$scope", "$routeParams", "cardlistSvc",
		function($scope, $routeParams, cardlistSvc) {

	//////////////////////////////////////////////////
	// Scope variables.
	//////////////////////////////////////////////////

	$scope.topicId = $routeParams.topicId;
	$scope.topicName = $scope.topicId;	// todo: get name from backend
	$scope.cards = [];


	//////////////////////////////////////////////////
	// General functions.
	//////////////////////////////////////////////////

	function handleApiError(err) {
		alert("Error: " + err.message);
	}

	function fetchCards() {
		cardlistSvc.queryCards($routeParams.topicId).then(function(resp_data) {
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
		window.location = `#!/topics/${$routeParams.topicId}/cards/0`;
	};


	//////////////////////////////////////////////////
	// Initialization.
	//////////////////////////////////////////////////

	init();

}]);
