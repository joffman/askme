angular.module("categories.services", [])
.factory("categoriesSvc", ["$resource", function($resource) {
	var categoriesResource = $resource("api1/categories/:category_id", {}, {});

	function queryCategories() {
		return categoriesResource.get().$promise;
	}

	function removeCategory(category_id) {
		return categoriesResource.remove({category_id: category_id}).$promise;
	}

	function addCategory(category_data) {
		// TODO: Better validation.
		var category = {};
		if ("name" in category_data) {
			category.name = category_data.name;
			return categoriesResource.save(category).$promise;
		} else {	// todo: error handling
			throw { message: "addCategory: Invalid category-data" };
		}
	}

	return {
		queryCategories: queryCategories,
		removeCategory: removeCategory,
		addCategory: addCategory
	};
}]);
