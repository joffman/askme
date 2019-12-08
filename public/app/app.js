var askMeApp = angular.module("askMeApp", [
    "ngRoute",
    "ngResource",
    "attachments",
    "quiz",
    "categoryList",
    "collectionList",
    "collectionDetails",
    "cardList",
    "cardDetails",
    "askmeHeader",
    "navigation"
]);

// Configure routes.
// TODO If possible, pass route-parameters as attributes to components.
askMeApp.config(function($routeProvider) {
    $routeProvider.when("/categories", {
        template: "<category-list></category-list>"
    });
    $routeProvider.when("/collections", {
        template: "<collection-list></collection-list>"
    });
    $routeProvider
        .when("/collections/:collectionId", {
            template: "<collection-details></collection-details>"
        })
        .when("/collections/:collectionId/cards", {
            template: "<card-list></card-list>"
        })
        .when("/collections/:collectionId/quiz", {
            template: "<quiz></quiz>"
        })
        .when("/collections/:collectionId/cards/:cardId", {
            template: "<card-details></card-details>"
        })
        .when("/collections/:collectionId/cards/:cardId/attachments", {
            template: "<attachments></attachments>"
        })
        .when("/about", {
            templateUrl: "app/about/about.html"
        })
        .otherwise({
            redirectTo: "/collections"
        });
});
