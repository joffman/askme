angular.module("card.controllers", ["card.services", "topiclist.services", "ngFileUpload"])
.controller("cardController", ["$scope", "$location", "$routeParams", "cardSvc", "topiclistSvc", "Upload",
		function($scope, $location, $routeParams, cardSvc, topiclistSvc, Upload) {

	// Set $scope.card.
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

	// Fetch topics.
	topiclistSvc.queryTopics().then(function(resp_data) {
		$scope.topics = resp_data.topics;
	})
	["catch"](function(error) {
		handleApiError(error);
	});


	//////////////////////////////////////////////////
	// Private functions.
	//////////////////////////////////////////////////

	function handleApiError(err) {
		alert("Error: " + err.message);
	}


	//////////////////////////////////////////////////
	// Scope functions.
	//////////////////////////////////////////////////

	$scope.openAttachments = function() {
		$location.url(`/topics/${$routeParams.topicId}/cards/${$scope.card.id}/attachments`);
	};

	$scope.onSubmit = function() {

		if ($scope.card.id === 0) {	// new card
			cardSvc.addCard($scope.card).then(function(response) {
				alert("Successfully added card.");
				$scope.card.id = response.id;
				// TODO Update url.
			}).catch(function(err) {
				handleApiError(err);
			});
		} else {	// existing card
			cardSvc.updateCard($scope.card).then(function(response) {
				alert("Successfully updated card.");
			}).catch(function(err) {
				handleApiError(err);
			});
		}
	};

		}
]);
