function CardListCtrl($routeParams, Card) {

	var self = this;

	//////////////////////////////////////////////////
	// Scope variables.
	//////////////////////////////////////////////////

	self.collectionId = $routeParams.collectionId;
	self.collectionName = self.collectionId;	// todo: get name from backend
	self.cards = [];


	//////////////////////////////////////////////////
	// General functions.
	//////////////////////////////////////////////////

	function handleApiError(err) {
		alert("Error: " + err.message);
	}

	function fetchCards() {
		Card.query({collectionId: $routeParams.collectionId})
			.$promise.then(function(respData) {
				self.cards = respData.cards;
			}).catch(function(error) {
				handleApiError(error);
			});
	}

	//////////////////////////////////////////////////
	// Scope functions.
	//////////////////////////////////////////////////

	self.remove = function(cardId) {
		Card.remove({id: cardId}).$promise.then(function(respData) {
			fetchCards();
		}).catch(function(error) {
			handleApiError(error);
		});
	};


	//////////////////////////////////////////////////
	// Initialization.
	//////////////////////////////////////////////////

	fetchCards();

}

angular.module("cardList")
.component("cardList", {
	templateUrl: "app/card-list/card-list.html",
	controller: ["$routeParams", "Card", CardListCtrl]
});
