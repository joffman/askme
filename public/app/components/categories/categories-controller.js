angular.module("categories.controllers", ["categories.services"])
.controller("categoriesController", ["$scope", "categoriesSvc",
		function($scope, categoriesSvc) {

	//////////////////////////////////////////////////
	// General functions.
	//////////////////////////////////////////////////

	function handleApiError(err) {
		alert("Error: " + err.message);
	}

	function fetchCategories() {
		categoriesSvc.queryCategories().then(function(resp_data) {
			$scope.categories = resp_data.categories;
		})
		["catch"](function(error) {
			handleApiError(error);
		});
	}

	function init() {
		fetchCategories();
	}


	//////////////////////////////////////////////////
	// Scope functions.
	//////////////////////////////////////////////////

	$scope.add = function() {
		// Create new category.
		var new_category = {
			name: $scope.new_category_name,
		};
		categoriesSvc.addCategory(new_category).then(function(resp_data) {
			fetchCategories();
		}).catch((error) => {
			handleApiError(error);
		});

		// Clear input.
		$scope.new_category_name = "";
	};

	$scope.remove = function(category_id) {
		categoriesSvc.removeCategory(category_id).then(function(resp_data) {
			fetchCategories();
		})
		["catch"](function(error) {
			handleApiError(error);
		});
	};


	//////////////////////////////////////////////////
	// Initialization.
	//////////////////////////////////////////////////

	init();

}]);
