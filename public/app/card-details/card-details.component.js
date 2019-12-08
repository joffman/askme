function CardDetailsCtrl($routeParams, Utils, Card, Collection) {
    var self = this;

    //////////////////////////////////////////////////
    // Set properties of self.
    //////////////////////////////////////////////////

    // Fetch card.
    if ($routeParams.cardId == 0) {
        // new card
        self.card = {
            id: 0,
            collectionId: $routeParams.collectionId
        };
    } else {
        // existing card
        Card.get({ id: $routeParams.cardId })
            .$promise.then(respData => {
                self.card = respData.card;
            })
            .catch(err => {
                Utils.handleApiError(err);
            });
    }

    // Fetch collections.
    Collection.query()
        .$promise.then(respData => {
            self.collections = respData.collections;
        })
        .catch(error => {
            Utils.handleApiError(error);
        });

    // Make collectionId from routeParams visible.
    self.collectionId = $routeParams.collectionId;

    //////////////////////////////////////////////////
    // Scope functions.
    //////////////////////////////////////////////////

    self.onSubmit = function() {
        if (self.card.id === 0) {
            // new card
            Card.save(self.card)
                .$promise.then(response => {
                    alert("Successfully added card.");
                    self.card.id = response.id;
                    // TODO Update url.
                })
                .catch(err => {
                    Utils.handleApiError(err);
                });
        } else {
            // existing card
            Card.update(self.card)
                .$promise.then(response => {
                    alert("Successfully updated card.");
                })
                .catch(err => {
                    Utils.handleApiError(err);
                });
        }
    };
}

angular.module("cardDetails").component("cardDetails", {
    templateUrl: "app/card-details/card-details.html",
    controller: ["$routeParams", "Utils", "Card", "Collection", CardDetailsCtrl]
});
