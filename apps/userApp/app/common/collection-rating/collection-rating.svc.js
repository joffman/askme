angular.module("common.collectionRating").factory("CollectionRating", [
    "$resource",
    function($resource) {
        return $resource(
            "/api1/collectionRatings/:id",
            {},
            {
                query: { method: "GET", isArray: false }
            }
        );
    }
]);
