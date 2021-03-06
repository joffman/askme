function CategoryListCtrl(Utils, Category) {
    var self = this;

    //////////////////////////////////////////////////
    // General functions.
    //////////////////////////////////////////////////

    function fetchCategories() {
        Category.query()
            .$promise.then(respData => {
                self.categories = respData.categories;
            })
            .catch(error => {
                Utils.handleApiError(error);
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
        var newCategory = {
            name: self.newCategoryName
        };
        Category.save(newCategory)
            .$promise.then(respData => {
                fetchCategories();
            })
            .catch(error => {
                Utils.handleApiError(error);
            });

        // Clear input.
        self.newCategoryName = "";
    };

    self.remove = function(categoryId) {
        Category.remove({ id: categoryId })
            .$promise.then(respData => {
                fetchCategories();
            })
            .catch(error => {
                Utils.handleApiError(error);
            });
    };

    //////////////////////////////////////////////////
    // Initialization.
    //////////////////////////////////////////////////

    init();
}

angular.module("categoryList").component("categoryList", {
    templateUrl: "app/category-list/category-list.html",
    controller: ["Utils", "Category", CategoryListCtrl]
});
