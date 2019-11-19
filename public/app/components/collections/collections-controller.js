angular.module("collections.controllers", ["collections.services"])
.controller("collectionsController", ["$scope", "collectionsSvc", function($scope, collectionsSvc) {

	//////////////////////////////////////////////////
	// General functions.
	//////////////////////////////////////////////////

	function handleApiError(err) {
		alert("Error: " + err.message);
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

	$scope.add = function() {
		// Create new collection.
		var new_collection = {
			name: $scope.new_collection_name,
		};
		collectionsSvc.addCollection(new_collection).then(function(resp_data) {
			fetchCollections();
		}).catch((error) => {
			handleApiError(error);
		});

		// Clear input.
		$scope.new_collection_name = "";
	};

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
