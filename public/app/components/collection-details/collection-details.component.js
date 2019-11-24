function CollectionDetailsCtrl($routeParams, Collection, Category) {
	var self = this;

	// Fetch collection with given id.
	self.collection = { id: $routeParams.collectionId };
	if (self.collection.id != 0) {
		Collection.get({ id: $routeParams.collectionId }).$promise
			.then((response) => {
				self.collection = response.collection;
			}).catch((err_resp) => {
				console.log("Error:", err_resp);
				alert("Error when fetching collection: " + err_resp.data.error_msg);
			});
	}

	// Fetch categories for multi-select-item.
	self.categories = [];
	Category.query().$promise
		.then((response) => {
			self.categories = response.categories;
		}).catch((err_resp) => {
			console.log("Error:", err_resp);
			alert("Error when fetching categories: " + err_resp.data.error_msg);
		});


	//////////////////////////////////////////////////
	// Public functions.
	//////////////////////////////////////////////////

	self.submit = function() {
		if (self.collection.id == 0) {
			// Add this new collection.
			Collection.save(self.collection).$promise
				.then((response) => {
					self.collection.id = response.id;
					// TODO: Update url.
					alert("Saved successfully!");
				}).catch((err_resp) => {
					alert("Error on save: " + err_resp.data.error_msg);
				});
		} else {
			// Update existing card.
			Collection.update(self.collection).$promise
				.then((response) => {
					alert("Collection updated successfully!");
				}).catch((err_resp) => {
					alert("Error on save: " + err_resp.data.error_msg);
				});
		}
	};
}

angular.module("collectionDetails")
.component("collectionDetails", {
	templateUrl: "app/components/collection-details/collection-details.template.html",
	controller: ["$routeParams", "Collection", "Category", CollectionDetailsCtrl]
});
