function NavigationCtrl($scope, $location, $timeout) {
    var self = this;

    self.element = null;
    self.navItems = $scope.navItems;

    // Returns the navItem that corresponds to the given url/path.
    // If no navigation-item corresponds to the given path, null
    // is returned.
    var navItemFromPath = function(path) {
        for (const navItem of self.navItems) {
            if (path == navItem.href.substring(2)) return navItem;
        }
        return null; // not found
    };

    self.markActiveItem = function(path) {
        // Use $timeout, just to make sure that angular already
        // inserted the ID into the DOM.
        $timeout(function() {
            // Unselect all navigation-items.
            self.element
                .find("li > a")
                .removeClass("active")
                .blur();
            // blur() is used to "unfocus".

            // Select the item that is active according to the
            // given url / path.
            var navItem = navItemFromPath(path);
            if (navItem) self.element.find("#" + navItem.id).addClass("active");
        });
    };

    // Keep the navigation items in sync with the url.
    $scope.$watch(
        () => {
            return $location.path();
        },
        path => {
            self.markActiveItem(path);
        }
    );
}

angular.module("navigation").directive("navigation", function() {
    return {
        restrict: "E",
        scope: {
            navItems: "<"
        },
        templateUrl: "/common/navigation/navigation.html",
        controller: ["$scope", "$location", "$timeout", NavigationCtrl],
        controllerAs: "$ctrl",
        link: function(scope, element, attrs, ctrl) {
            ctrl.element = element;
        }
    };
});
