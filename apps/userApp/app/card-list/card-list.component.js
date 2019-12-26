function CardListCtrl($routeParams, Utils, Card) {
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
        Card.remove({ id: cardId })
            .$promise.then(function(respData) {
                fetchCards();
            })
            .catch(function(error) {
                Utils.handleApiError(error);
            });
    };

    //////////////////////////////////////////////////
    // Initialization.
    //////////////////////////////////////////////////

    fetchCards();
}

angular.module("cardList").component("cardList", {
    templateUrl: "app/card-list/card-list.html",
    controller: ["$routeParams", "Utils", "Card", CardListCtrl]
});
