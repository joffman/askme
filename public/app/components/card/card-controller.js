angular.module("card.controllers", ["card.services"])
.controller("cardController", ["$scope", "$routeParams", "cardSvc",
		function($scope, $routeParams, cardSvc) {

	if ($routeParams.cardId == 0) {	// new card
		$scope.card = {
			id: 0,
			topic_id: $routeParams.topicId
		};
	} else {						// existing card
		cardSvc.getCard($routeParams.cardId).then(function(resp_data) {
			$scope.card = resp_data.card;
		})
		["catch"](function(err) {
			handleApiError(err);
		});
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
				if (resp_data.success) {
					// Redirect to cards of topic.
					window.location = `#!/topics/${$scope.card.topic_id}/cards`;
				} else {
					throw {message: resp_data.error_msg};
				}
			})["catch"](function(err) {
				handleApiError(err);
			});

		} else {
			cardSvc.updateCard($scope.card).then(function(resp_data) {
				if (resp_data.success) {
					// Redirect to cards of topic.
					window.location = `#!/topics/${$scope.card.topic_id}/cards`;
				} else {
					throw {message: resp_data.error_msg};
				}
			})["catch"](function(err) {
				handleApiError(err);
			});
		}
	};

}]);
