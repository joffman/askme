function CardListCtrl($routeParams, $location, Card) {

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

	self.onAddCardClicked = function() {
		$location.url(`/collections/${$routeParams.collectionId}/cards/0`);
	};

	self.startQuiz = function() {
		$location.url(`/collections/${$routeParams.collectionId}/quiz`);
	};


	//////////////////////////////////////////////////
	// Initialization.
	//////////////////////////////////////////////////

	fetchCards();

}

angular.module("cardList")
.component("cardList", {
	templateUrl: "app/components/card-list/card-list.html",
	controller: ["$routeParams", "$location", "Card", CardListCtrl]
});
