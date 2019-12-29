var adminApp = angular.module("adminApp", [
    "ngRoute",
    "ngResource",
    "categoryList",
    "askmeHeader",
    "navigation"
]);

// Configure routes.
adminApp.config(function($routeProvider) {
    $routeProvider.when("/categories", {
        template: "<category-list></category-list>"
    }).otherwise({
            redirectTo: "/categories"
        });
});

// Create controller for navigation.
adminApp.controller("AdminNavigationController", ["$scope",
		function($scope) {
			$scope.navItems = [
			{
				id: "categoriesNav",
				href: "#!/categories",
				name: "Categories"
			}
			// todo: Add user management.
			];
		}
]);
