angular.module("common.category").factory("Category", [
    "$resource",
    function($resource) {
        return $resource(
            "/api1/categories/:id",
            {},
            {
                query: { method: "GET", isArray: false }
            }
        );
    }
]);
