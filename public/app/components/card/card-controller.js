angular.module("card.controllers", ["card.services"])
.controller("cardController", ["$scope", "$routeParams", "cardSvc",
		function($scope, $routeParams, cardSvc) {

	if ($routeParams.cardId == 0) {	// new card
		$scope.card = {
			id: 0,
			topic_id: $routeParams.topicId
		};
	} else {						// existing card
		$scope.card = cardSvc.getCard($routeParams.cardId);
		//$scope.card = {
		//	id: 2,
		//	title: "Second card",
		//	question: "When was C++ created?",
		//	answer: "1985"
		//};
	}


	//////////////////////////////////////////////////
	// General functions.
	//////////////////////////////////////////////////

	function handleApiError(err) {
		alert("Error: " + err.message);
	}


	//////////////////////////////////////////////////
	// Scope functions.
	//////////////////////////////////////////////////

	$scope.onSubmit = function() {
		if ($scope.card.id === 0) {
			cardSvc.addCard($scope.card).then(function(resp_data) {
				// Redirect to cards of topic.
				window.location = `#!/topics/${$scope.card.topic_id}/cards`;
			})
			["catch"](function(error) {
				handleApiError(error);
			});

		} else {
			cardSvc.updateCard($scope.card).then(function(resp_data) {
				// Redirect to cards of topic.
				window.location = `#!/topics/${topic_id}/cards`;
			})
			["catch"](function(error) {
				handleApiError(error);
			});
		}
	};

}]);
