function NavigationCtrl() {
    var self = this;

    //////////////////////////////////////////////////
    // Scope variables.
    //////////////////////////////////////////////////

	// TODO Get selected item from url and keep it in sync.
	self.selectedNavItem = null;

    //////////////////////////////////////////////////
    // General functions.
    //////////////////////////////////////////////////

    //////////////////////////////////////////////////
    // Scope functions.
    //////////////////////////////////////////////////

	self.selectNavItem = function(event) {
		var elem = angular.element(event.target);

		// Unselect all navigation-items.
		var ul = elem.parents("ul");
		ul.find("li > a").removeClass("active");

		// Select the clicked item.
		elem.addClass("active");
	};
}

angular.module("navigation").component("navigation", {
    templateUrl: "app/navigation/navigation.html",
    controller: [NavigationCtrl]
});
