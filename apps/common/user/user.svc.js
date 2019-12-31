angular.module("common.user").factory("User", [
    "$http",
    function($http) {
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

        return fact;
    }
]);
