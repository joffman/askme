function CollectionListCtrl(Collection) {
    var self = this;

    //////////////////////////////////////////////////
    // General functions.
    //////////////////////////////////////////////////

    function handleApiError(err) {
        alert("Error: " + err.data.errorMsg);
    }

    function fetchCollections() {
        Collection.query()
            .$promise.then(respData => {
                self.collections = respData.collections;
            })
            .catch(error => {
                handleApiError(error);
            });
    }

    function init() {
        fetchCollections();
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
                handleApiError(error);
            });
    };

    //////////////////////////////////////////////////
    // Initialization.
    //////////////////////////////////////////////////

    init();
}

angular.module("collectionList").component("collectionList", {
    templateUrl: "app/collection-list/collection-list.html",
    controller: ["Collection", CollectionListCtrl]
});
