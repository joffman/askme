function CollectionListCtrl($window, Utils, Collection) {
    var self = this;

    //////////////////////////////////////////////////
    // General functions.
    //////////////////////////////////////////////////

    function fetchCollections() {
		Collection.query({
			filter: self.filter
		})
		.$promise.then(respData => {
			self.collections = respData.collections;
		})
		.catch(error => {
			Utils.handleApiError(error);
		});
	}

    //////////////////////////////////////////////////
    // Scope functions.
    //////////////////////////////////////////////////

    self.remove = function(collectionId) {
        Collection.remove({ id: collectionId })
            .$promise.then(respData => {
                fetchCollections();
            })
            .catch(error => {
                Utils.handleApiError(error);
            });
    };

    //////////////////////////////////////////////////
    // Initialization.
    //////////////////////////////////////////////////

	self.$onInit = function() {
		fetchCollections();
	};
}

angular.module("collectionList").component("collectionList", {
    templateUrl: "app/collection-list/collection-list.html",
    controller: ["$window", "Utils", "Collection", CollectionListCtrl],
	bindings: {
		filter: "@"
	}
});