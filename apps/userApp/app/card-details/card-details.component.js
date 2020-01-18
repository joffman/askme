function CardDetailsCtrl(Utils, Card, Collection) {
    var self = this;

    //////////////////////////////////////////////////
    // Initialization.
    //////////////////////////////////////////////////

    // Fetch card.
    self.card = {};

    self.$onInit = function() {
        self.collectionId = parseInt(self.collectionId);
        self.cardId = parseInt(self.cardId);
        if (isNaN(self.collectionId) || isNaN(self.cardId))
            throw Error("Invalid collection-id or card-id argument.");

        if (self.cardId == 0) {
            // New card.
            self.card = {
                id: 0,
                collectionId: self.collectionId
            };
        } else {
            // Existing card. Get all the details.
            Card.get({ id: self.cardId })
                .$promise.then(respData => {
                    self.card = respData.card;
                })
                .catch(err => {
                    Utils.handleApiError(err);
                });
        }
    };

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
    controller: ["Utils", "Card", "Collection", CardDetailsCtrl],
    bindings: {
        collectionId: "@",
        cardId: "@"
    }
});
