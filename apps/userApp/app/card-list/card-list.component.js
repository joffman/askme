function CardListCtrl($window, Utils, Card) {
    var self = this;

    //////////////////////////////////////////////////
    // General functions.
    //////////////////////////////////////////////////

    function fetchCards() {
        Card.query({ collectionId: self.collectionId })
            .$promise.then(function(respData) {
                self.cards = respData.cards;
            })
            .catch(function(error) {
                Utils.handleApiError(error);
            });
    }

    //////////////////////////////////////////////////
    // Scope functions.
    //////////////////////////////////////////////////

    self.remove = function(cardId) {
        if ($window.confirm("Do you really want to remove this card?")) {
            Card.remove({ id: cardId })
                .$promise.then(function(respData) {
                    fetchCards();
                    $window.alert("Card removed successfully!");
                })
                .catch(function(error) {
                    Utils.handleApiError(error);
                });
        }
    };

    //////////////////////////////////////////////////
    // Initialization.
    //////////////////////////////////////////////////

    self.$onInit = function() {
		// Init data members.
		self.collectionName = self.collectionId; // todo: get name from backend
		self.cards = [];

		fetchCards();
	};
}

angular.module("cardList").component("cardList", {
    templateUrl: "app/card-list/card-list.html",
    bindings: {
        collectionId: "@"
    },
    controller: ["$window", "Utils", "Card", CardListCtrl]
});
