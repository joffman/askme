angular.module("common.user").factory("User", [
    "$http", "$resource",
    function($http, $resource) {
        var fact = {};

        fact.logout = function() {
            return $http({
                method: "POST",
                url: "/logout"
            });
        };

        fact.getActiveUser = function() {
            return $http({
                method: "GET",
                url: "/api1/users/me"
            });
        };

		fact.resource = $resource(
            "/api1/users/:id",
            {},
            {
                query: { method: "GET", isArray: false }
            }
        );

        return fact;
    }
]);
