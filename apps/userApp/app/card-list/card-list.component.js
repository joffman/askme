function CardListCtrl($window, $routeParams, Utils, Card) {
    var self = this;

    //////////////////////////////////////////////////
    // Scope variables.
    //////////////////////////////////////////////////

    self.collectionId = $routeParams.collectionId;
    self.collectionName = self.collectionId; // todo: get name from backend
    self.cards = [];

    //////////////////////////////////////////////////
    // General functions.
    //////////////////////////////////////////////////

    function fetchCards() {
        Card.query({ collectionId: $routeParams.collectionId })
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
		if ($window.confirm("Do you really want to remove "
					+ "this card?")) {
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

    fetchCards();
}

angular.module("cardList").component("cardList", {
    templateUrl: "app/card-list/card-list.html",
    controller: ["$window", "$routeParams", "Utils", "Card", CardListCtrl]
});
