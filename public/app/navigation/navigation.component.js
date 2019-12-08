function NavigationCtrl($scope, $location) {
    var self = this;

	markNavItem = function(elemId) {
		// Unselect all navigation-items.
		var ul = angular.element("header nav ul");
		ul.find("li > a").removeClass("active").blur();
		// blur() is used to "unfocus".

		// Select the clicked item.
		angular.element("header nav " + elemId).addClass("active");
	};

	// Keep the navigation items in sync with the url.
	$scope.$watch(() => {
		return $location.path();
	}, path => {
		switch (path) {
			case "/categories":
				markNavItem("#categoriesNav");
				break;
			case "/collections":
				markNavItem("#collectionsNav");
				break;
			case "/about":
				markNavItem("#aboutNav");
				break;
		}
	});
}

angular.module("navigation").component("navigation", {
    templateUrl: "app/navigation/navigation.html",
    controller: ["$scope", "$location", NavigationCtrl]
});
