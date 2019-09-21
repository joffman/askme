angular.module("cardlist.services", [])
.factory("cardlistSvc", ["$resource", function($resource) {
	var cardlistResource = $resource("api1/cards/:card_id", {}, {});

	function queryCards() {
		return cardlistResource.get().$promise;
	}

	function removeCard(card_id) {
		return cardlistResource.remove({card_id: card_id}).$promise;
	}

	function addCard(card_data) {
		// TODO Validation and error handling.
		return cardlistResource.save(card_data).$promise;
	}

	return {
		queryCards: queryCards,
		removeCard: removeCard,
		addCard: addCard
	};
}]);
