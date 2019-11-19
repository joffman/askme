angular.module("card.services", [])
.factory("cardSvc", ["$resource", function($resource) {
	var cardResource = $resource("api1/cards/:card_id", {}, {
		update: {method: "PUT", params: {card_id: "@id"}}
	});

	// TODO Fail when card cannot be fetched.
	function getCard(card_id) {
		return cardResource.get({card_id: card_id}).$promise;
	}

	function addCard(card_data) {
		return cardResource.save(card_data).$promise;
	}

	function updateCard(card_data) {
		return cardResource.update(card_data).$promise;
	}

	return {
		getCard: getCard,
		addCard: addCard,
		updateCard: updateCard
	};
}]);
