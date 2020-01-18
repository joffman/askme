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

	self.removeCollection = function(collectionId) {
		for (var i = 0; i < self.collections.length; ++i) {
			var coll = self.collections[i];
			if (coll.id == collectionId) {
				self.collections.splice(i, 1);	// remove collection
				break;
			}
		}
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
