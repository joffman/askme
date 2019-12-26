angular.module("common.card").factory("Card", [
    "$resource",
    function($resource) {
        return $resource(
            "/api1/cards/:id",
            {},
            {
                query: { method: "GET", isArray: false },
                update: { method: "PUT", params: { id: "@id" } }
            }
        );
    }
]);
