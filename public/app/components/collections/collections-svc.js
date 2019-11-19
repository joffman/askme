angular.module("collections.services", [])
.factory("collectionsSvc", ["$resource", function($resource) {
	var collectionsResource = $resource("api1/collections/:collection_id", {}, {});

	function queryCollections() {
		return collectionsResource.get().$promise;
	}

	function removeCollection(collection_id) {
		return collectionsResource.remove({collection_id: collection_id}).$promise;
	}

	function addCollection(collection_data) {
		// TODO: Better validation.
		var collection = {};
		if ("name" in collection_data) {
			collection.name = collection_data.name;
			return collectionsResource.save(collection).$promise;
		} else {	// todo: error handling
			throw { message: "addCollection: Invalid collection-data" };
		}
	}

	return {
		queryCollections: queryCollections,
		removeCollection: removeCollection,
		addCollection: addCollection
	};
}]);
