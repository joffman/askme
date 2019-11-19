angular.module("cardlist.services", [])
.factory("cardlistSvc", ["$resource", function($resource) {
	// todo: I think this should be merged with card.services.
	var cardlistResource = $resource("api1/cards/:card_id", {}, {});

	function queryCards(collection_id) {
		return cardlistResource.get({collection_id: collection_id}).$promise;
	}

	function removeCard(card_id) {
		return cardlistResource.remove({card_id: card_id}).$promise;
	}

	return {
		queryCards: queryCards,
		removeCard: removeCard
	};
}]);
