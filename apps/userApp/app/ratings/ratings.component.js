function RatingsCtrl($timeout, Utils, CollectionRating, User) {
    var self = this;

    //////////////////////////////////////////////////
    // Scope (public) data members.
    //////////////////////////////////////////////////

    self.averageRating = 0;
    self.ratings = [];
    self.users = {};

    self.ratingOptions = [
        {
            value: 1,
            name: "Terrible"
        },
        {
            value: 2,
            name: "Bad"
        },
        {
            value: 3,
            name: "OK"
        },
        {
            value: 4,
            name: "Good"
        },
        {
            value: 5,
            name: "Great"
        }
    ];

    //////////////////////////////////////////////////
    // Private functions.
    //////////////////////////////////////////////////

    function fetchRatings() {
        CollectionRating.query({
            collectionId: self.collectionId
        })
            .$promise.then(respData => {
                self.ratings = respData.ratings;

                self.averageRating = 0;
                if (self.ratings.length > 0) {
                    for (var r of self.ratings) {
                        self.averageRating += r.rating;
                    }
                    self.averageRating /= self.ratings.length;
                }
            })
            .catch(error => {
                Utils.handleApiError(error);
            });
    }

    function fetchUsers() {
        User.resource
            .query()
            .$promise.then(respData => {
                // Build map of users with userid as key.
                for (var u of respData.users) {
                    self.users[u.id] = u;
                }
            })
            .catch(error => {
                Utils.handleApiError(error);
            });
    }

    //////////////////////////////////////////////////
    // Scope (public) functions.
    //////////////////////////////////////////////////

    self.submitRating = function() {
        CollectionRating.save({
            collectionId: self.collectionId,
            rating: self.rating
        })
            .$promise.then(response => {
                fetchRatings(); // why is the request send only after we close the alert?
                alert("Saved rating successfully!");
                // todo: Clear form.
            })
            .catch(errorResp => {
                console.log("Error on save:", errorResp);
                Utils.handleApiError(errorResp);
            });
    };

    //////////////////////////////////////////////////
    // Initialization.
    //////////////////////////////////////////////////

    self.$onInit = function() {
        if (self.showRatingList === "true") {
            fetchRatings();
            fetchUsers();
        }
    };
}

angular.module("ratings").component("ratings", {
    templateUrl: "app/ratings/ratings.html",
    controller: ["$timeout", "Utils", "CollectionRating", "User", RatingsCtrl],
    bindings: {
        collectionId: "@",
        showRatingForm: "@",
        showRatingList: "@"
    }
});
