var askMeApp = angular.module("askMeApp", [
    "ngRoute",
    "ngResource",
    "attachments",
    "quiz",
    "collectionList",
    "collectionDetails",
    "cardList",
    "cardDetails",
    "askmeHeader",
    "navigation",
	"common.utils",
	"common.user"
]);

// Configure routes.
// TODO If possible, pass route-parameters as attributes to components.
askMeApp.config(function($routeProvider) {
    $routeProvider
        .when("/collections/public", {
            template: '<collection-list filter="public"></collection-list>'
        })
        .when("/collections/me", {
            template: '<collection-list filter="me"></collection-list>'
        })
        .when("/collections/:collectionId/details", {
            template: function(params) {
				return '<collection-details collection-id="'
					+ params.collectionId
					+ '"></collection-details>';
			}
        })
        .when("/collections/:collectionId/cards", {
            template: "<card-list></card-list>"
        })
        .when("/collections/:collectionId/quiz", {
            template: "<quiz></quiz>"
        })
        .when("/collections/:collectionId/cards/:cardId", {
            template: function(params) {
			   return `<card-details collection-id="${params.collectionId}"
				   card-id="${params.cardId}">
				   </card-details>`;
			}
        })
        .when("/collections/:collectionId/cards/:cardId/attachments", {
            template: "<attachments></attachments>"
        })
        .when("/about", {
            templateUrl: "app/about/about.html"
        })
        .otherwise({
            redirectTo: "/collections/public"
        });
});

// Create controller for navigation.
askMeApp.controller("AskmeNavigationController", [
    "$scope", "User", "Utils",
    function($scope, User, Utils) {
		// Define navigation items.
        $scope.navItems = [
            {
                id: "publicCollectionsNav",
                href: "#!/collections/public",
                name: "Public Collections"
            },
            {
                id: "myCollectionsNav",
                href: "#!/collections/me",
                name: "My Collections"
            },
            {
                id: "aboutNav",
                href: "#!/about",
                name: "About"
            }
        ];

		// Store the user in localStorage.
		User.getActiveUser().then(response => {
			localStorage.setItem("askme_user", JSON.stringify(response.data.user));
		}).catch(response => {
			Utils.handleApiError(response);
		});
 	}
]);
