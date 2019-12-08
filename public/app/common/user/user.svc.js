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

        return fact;
    }
]);
