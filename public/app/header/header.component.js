function HeaderCtrl($window, Utils, User) {
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
		User.logout().then(response => {
			console.log("User logged out.");
			$window.location.href = "/login";
		}).catch(response => {
			console.log("Error on logout:", response);
			Utils.handleApiError(response);
		});
	};
}

angular.module("askmeHeader").component("askmeHeader", {
    templateUrl: "app/header/header.html",
    controller: ["$window", "Utils", "User", HeaderCtrl]
});
