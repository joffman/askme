function CollectionDetailsCtrl($routeParams, Utils, Collection, Category) {
    var self = this;

    // Fetch collection with given id.
    self.collection = { id: $routeParams.collectionId };
    if (self.collection.id != 0) {
        Collection.get({ id: $routeParams.collectionId })
            .$promise.then(response => {
                self.collection = response.collection;
            })
            .catch(errorResp => {
                console.log("Error:", errorResp);
                Utils.handleApiError(errorResp);
            });
    }

    // Fetch categories for multi-select-item.
    self.categories = [];
    Category.query()
        .$promise.then(response => {
            self.categories = response.categories;
        })
        .catch(errorResp => {
            console.log("Error:", errorResp);
            Utils.handleApiError(errorResp);
        });

    //////////////////////////////////////////////////
    // Public functions.
    //////////////////////////////////////////////////

    self.submit = function() {
        if (self.collection.id == 0) {
            // Add this new collection.
            Collection.save(self.collection)
                .$promise.then(response => {
                    self.collection.id = response.id;
                    // TODO: Update url.
                    alert("Saved successfully!");
                })
                .catch(errorResp => {
                    console("Error on save:", errorResp);
                    Utils.handleApiError(errorResp);
                });
        } else {
            // Update existing card.
            Collection.update(self.collection)
                .$promise.then(response => {
                    alert("Collection updated successfully!");
                })
                .catch(errorResp => {
                    console("Error on update:", errorResp);
                    Utils.handleApiError(errorResp);
                });
        }
    };
}

angular.module("collectionDetails").component("collectionDetails", {
    templateUrl: "app/collection-details/collection-details.html",
    controller: [
        "$routeParams",
        "Utils",
        "Collection",
        "Category",
        CollectionDetailsCtrl
    ]
});
