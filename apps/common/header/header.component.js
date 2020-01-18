function HeaderCtrl($scope, $window, Utils, User) {
    var self = this;

    //////////////////////////////////////////////////
    // Scope variables.
    //////////////////////////////////////////////////

    //////////////////////////////////////////////////
    // General functions.
    //////////////////////////////////////////////////

    //////////////////////////////////////////////////
    // Scope functions.
    //////////////////////////////////////////////////

    self.logout = function() {
        User.logout()
            .then(response => {
                console.log("User logged out.");
                localStorage.removeItem("askme_user");
                $window.location.href = "/login";
            })
            .catch(response => {
                console.log("Error on logout:", response);
                Utils.handleApiError(response);
            });
    };
}

angular.module("askmeHeader").component("askmeHeader", {
    templateUrl: "/common/header/header.html",
    controller: ["$scope", "$window", "Utils", "User", HeaderCtrl],
    bindings: {
        isAdmin: "@admin"
    }
});
