angular.module("collections.controllers", ["collections.services"])
.controller("collectionsController", ["$scope", "collectionsSvc", function($scope, collectionsSvc) {

	//////////////////////////////////////////////////
	// General functions.
	//////////////////////////////////////////////////

	function handleApiError(err) {
		alert("Error: " + err.data.error_msg);
	}

	function fetchCollections() {
		collectionsSvc.queryCollections().then(function(resp_data) {
			$scope.collections = resp_data.collections;
		})
		["catch"](function(error) {
			handleApiError(error);
		});
	}

	function init() {
		fetchCollections();
	}


	//////////////////////////////////////////////////
	// Scope functions.
	//////////////////////////////////////////////////

	$scope.remove = function(collection_id) {
		collectionsSvc.removeCollection(collection_id).then(function(resp_data) {
			fetchCollections();
		})
		["catch"](function(error) {
			handleApiError(error);
		});
	};

	$scope.onCollectionClicked = function(collection_id) {
		window.location = `#!/collections/${collection_id}/cards`;
		// TODO: we probably want to use $location.path("/...");
	};


	//////////////////////////////////////////////////
	// Initialization.
	//////////////////////////////////////////////////

	init();

}]);
