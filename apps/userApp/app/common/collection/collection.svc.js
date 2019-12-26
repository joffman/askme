angular.module("common.collection").factory("Collection", [
    "$resource",
    function($resource) {
        return $resource(
            "/api1/collections/:id",
            {},
            {
                query: { method: "GET", isArray: false },
                update: { method: "PUT", params: { id: "@id" } }
            }
        );
    }
]);
