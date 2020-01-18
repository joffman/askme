function CollectionDetailsCtrl($location, Utils, Collection, Category) {
    var self = this;

    //////////////////////////////////////////////////
    // Initialization.
    //////////////////////////////////////////////////

    self.isOwner = false;

    // Fetch collection with given id.
    self.collection = {};
    var fetchCollection = function(collectionId) {
        self.collection = { id: collectionId };
        if (self.collection.id != 0) {
            Collection.get({ id: collectionId })
                .$promise.then(response => {
                    self.collection = response.collection;

                    // Are we the owner of this collection?
                    var thisUser = localStorage.getItem("askme_user");
                    if (thisUser) {
                        thisUser = JSON.parse(thisUser);
                        self.isOwner = thisUser.id == self.collection.userId;
                    }
                })
                .catch(errorResp => {
                    console.log("Error on getting collection:", errorResp);
                    Utils.handleApiError(errorResp);
                });
        }
    };

    // Fetch categories for multi-select-item.
    self.categories = [];
    var fetchCategories = function() {
        Category.query()
            .$promise.then(response => {
                self.categories = response.categories;
            })
            .catch(errorResp => {
                console.log("Error:", errorResp);
                Utils.handleApiError(errorResp);
            });
    };

    self.$onInit = function() {
        fetchCollection(self.collectionId);
        fetchCategories();
    };

    //////////////////////////////////////////////////
    // Public functions.
    //////////////////////////////////////////////////

    self.submitCollection = function() {
        if (self.collection.id == 0) {
            // Add this new collection.
            Collection.save(self.collection)
                .$promise.then(response => {
                    self.collection.id = response.id;
                    alert("Saved successfully!");
                    $location.path(
                        `/collections/${self.collection.id}/details`
                    );
                })
                .catch(errorResp => {
                    console.log("Error on save:", errorResp);
                    Utils.handleApiError(errorResp);
                });
        } else {
            // Update existing card.
            Collection.update(self.collection)
                .$promise.then(response => {
                    alert("Collection updated successfully!");
                })
                .catch(errorResp => {
                    console.log("Error on update:", errorResp);
                    Utils.handleApiError(errorResp);
                });
        }
    };
}

angular.module("collectionDetails").component("collectionDetails", {
    templateUrl: "app/collection-details/collection-details.html",
    controller: [
        "$location",
        "Utils",
        "Collection",
        "Category",
        CollectionDetailsCtrl
    ],
    bindings: {
        collectionId: "@"
    }
});
