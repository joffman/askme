function CollectionTileCtrl($scope, Utils, Collection) {
    var self = this;

    //////////////////////////////////////////////////
    // General functions.
    //////////////////////////////////////////////////


    //////////////////////////////////////////////////
    // Scope functions.
    //////////////////////////////////////////////////

    var remove = function(collectionId) {
        Collection.remove({ id: collectionId })
            .$promise.then(respData => {
                //fetchCollections();
            })
            .catch(error => {
                Utils.handleApiError(error);
            });
    };

    //////////////////////////////////////////////////
    // Initialization.
    //////////////////////////////////////////////////

	self.$onInit = function() {
	};

    //////////////////////////////////////////////////
	// Maintaining state variables.
    //////////////////////////////////////////////////
}

angular.module("collectionTile").component("collectionTile", {
    templateUrl: "app/collection-tile/collection-tile.html",
    controller: ["$scope", "Utils", "Collection", CollectionTileCtrl],
	bindings: {
		collection: "<"
	}
});
