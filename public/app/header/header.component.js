function HeaderCtrl($window, User) {
    var self = this;

    //////////////////////////////////////////////////
    // Scope variables.
    //////////////////////////////////////////////////

    //////////////////////////////////////////////////
    // General functions.
    //////////////////////////////////////////////////

    function handleApiError(err) {
        alert("Error: " + err.data.errorMsg);
    }

    //////////////////////////////////////////////////
    // Scope functions.
    //////////////////////////////////////////////////

	self.logout = function() {
		User.logout().then(response => {
			console.log("User logged out.");
			$window.location.href = "/login";
		}).catch(response => {
			handleApiError(response);
		});
	};
}

angular.module("askmeHeader").component("askmeHeader", {
    templateUrl: "app/header/header.html",
    controller: ["$window", "User", HeaderCtrl]
});
