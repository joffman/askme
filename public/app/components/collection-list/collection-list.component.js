function CollectionListCtrl(Collection) {

	var self = this;

	//////////////////////////////////////////////////
	// General functions.
	//////////////////////////////////////////////////

	function handleApiError(err) {
		alert("Error: " + err.data.error_msg);
	}

	function fetchCollections() {
		Collection.query().$promise.then((resp_data) => {
			self.collections = resp_data.collections;
		}).catch((error) => {
			handleApiError(error);
		});
	}

	function init() {
		fetchCollections();
	}


	//////////////////////////////////////////////////
	// Scope functions.
	//////////////////////////////////////////////////

	self.remove = function(collection_id) {
		Collection.remove({id: collection_id}).$promise.then((resp_data) => {
			fetchCollections();
		}).catch((error) => {
			handleApiError(error);
		});
	};

	self.onCollectionClicked = function(collection_id) {
		window.location = `#!/collections/${collection_id}/cards`;
		// TODO: we probably want to use $location.path("/...");
	};


	//////////////////////////////////////////////////
	// Initialization.
	//////////////////////////////////////////////////

	init();

}

angular.module("collectionList")
.component("collectionList", {
	templateUrl: "app/components/collection-list/collection-list.html",
	controller: ["Collection", CollectionListCtrl]
});
