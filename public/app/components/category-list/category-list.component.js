function CategoryListCtrl(Category) {

	var self = this;

	//////////////////////////////////////////////////
	// General functions.
	//////////////////////////////////////////////////

	function handleApiError(err) {
		alert("Error: " + err.data.error_msg);
	}

	function fetchCategories() {
		Category.query().$promise.then((resp_data) => {
			self.categories = resp_data.categories;
		}).catch((error) => {
			handleApiError(error);
		});
	}

	function init() {
		fetchCategories();
	}


	//////////////////////////////////////////////////
	// Scope functions.
	//////////////////////////////////////////////////

	self.add = function() {
		// Create new category.
		var new_category = {
			name: self.new_category_name,
		};
		Category.save(new_category).$promise.then((resp_data) => {
			fetchCategories();
		}).catch((error) => {
			handleApiError(error);
		});

		// Clear input.
		self.new_category_name = "";
	};

	self.remove = function(category_id) {
		Category.remove({id: category_id}).$promise.then((resp_data) => {
			fetchCategories();
		}).catch((error) => {
			handleApiError(error);
		});
	};


	//////////////////////////////////////////////////
	// Initialization.
	//////////////////////////////////////////////////

	init();

}

angular.module("categoryList")
.component("categoryList", {
	templateUrl: "app/components/category-list/category-list.html",
	controller: ["Category", CategoryListCtrl]
});
