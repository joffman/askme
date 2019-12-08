angular.module("common.utils").factory("Utils", [
    "$window",
    function($window) {
        var fact = {};

        fact.handleApiError = function(response) {
            if (response.status == 401) {
                alert("You have been logged out.");
                $window.location.href = "/login";
            } else {
                alert("Error: " + response.data.errorMsg);
            }
        };

        return fact;
    }
]);
