function CardListCtrl($routeParams, $location, Card) {

	var self = this;

	//////////////////////////////////////////////////
	// Scope variables.
	//////////////////////////////////////////////////

	self.collection_id = $routeParams.collection_id;
	self.collection_name = self.collection_id;	// todo: get name from backend
	self.cards = [];


	//////////////////////////////////////////////////
	// General functions.
	//////////////////////////////////////////////////

	function handleApiError(err) {
		alert("Error: " + err.message);
	}

	function fetchCards() {
		Card.query({collection_id: $routeParams.collection_id})
			.$promise.then(function(resp_data) {
				self.cards = resp_data.cards;
			}).catch(function(error) {
				handleApiError(error);
			});
	}

	//////////////////////////////////////////////////
	// Scope functions.
	//////////////////////////////////////////////////

	self.remove = function(card_id) {
		Card.remove({card_id: card_id}).$promise.then(function(resp_data) {
			fetchCards();
		}).catch(function(error) {
			handleApiError(error);
		});
	};

	self.onAddCardClicked = function() {
		$location.url(`/collections/${$routeParams.collection_id}/cards/0`);
	};

	self.startQuiz = function() {
		$location.url(`/collections/${$routeParams.collection_id}/quiz`);
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
