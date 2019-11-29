angular.module("card.controllers", ["card.services", "collections.services", "ngFileUpload"])
.controller("cardController", ["$scope", "$location", "$routeParams", "cardSvc", "collectionsSvc", "Upload",
		function($scope, $location, $routeParams, cardSvc, collectionsSvc, Upload) {

	// Set $scope.card.
	if ($routeParams.card_id == 0) {	// new card
		$scope.card = {
			id: 0,
			collection_id: $routeParams.collection_id
		};
	} else {						// existing card
		cardSvc.getCard($routeParams.card_id).then(function(resp_data) {
			$scope.card = resp_data.card;
		})
		["catch"](function(err) {
			handleApiError(err);
		});
	}

	// Fetch collections.
	collectionsSvc.queryCollections().then(function(resp_data) {
		$scope.collections = resp_data.collections;
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
		$location.url(`/collections/${$routeParams.collection_id}/cards/${$scope.card.id}/attachments`);
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
