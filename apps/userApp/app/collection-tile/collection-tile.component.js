function CollectionTileCtrl($scope, $window, Utils, Collection) {
    var self = this;

    //////////////////////////////////////////////////
    // General functions.
    //////////////////////////////////////////////////

    //////////////////////////////////////////////////
    // Scope functions.
    //////////////////////////////////////////////////

    self.remove = function(collectionId) {
        if (
            $window.confirm(
                "Do you really want to remove " + "this collection?"
            )
        ) {
            Collection.remove({ id: collectionId })
                .$promise.then(respData => {
                    self.onRemove(self.collection.id);
                    $window.alert("Collection removed successfully!");
                })
                .catch(error => {
                    console.error(
                        "Error caught when removing collection:",
                        error
                    );
                    Utils.handleApiError(error);
                });
        }
    };

    self.publish = function(collectionId) {
        if (
            $window.confirm(
                "Do you really want to publish " + "this collection?"
            )
        ) {
            Collection.publish({ id: collectionId })
                .$promise.then(respData => {
                    // todo: maybe check success field here
                    self.collection.public = 1;
                    $window.alert("Collection published successfully!");
                })
                .catch(error => {
                    Utils.handleApiError(error);
                });
        }
    };

    //////////////////////////////////////////////////
    // Initialization.
    //////////////////////////////////////////////////

    self.$onInit = function() {};

    //////////////////////////////////////////////////
    // Maintaining state variables.
    //////////////////////////////////////////////////
}

angular.module("collectionTile").component("collectionTile", {
    templateUrl: "app/collection-tile/collection-tile.html",
    controller: [
        "$scope",
        "$window",
        "Utils",
        "Collection",
        CollectionTileCtrl
    ],
    bindings: {
        collection: "<",
        onRemove: "<"
    }
});
