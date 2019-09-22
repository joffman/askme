angular.module("card.services", [])
.factory("cardSvc", ["$resource", function($resource) {
	var cardResource = $resource("api1/cards/:card_id", {}, {});

	function getCard(card_id) {
		return cardResource.get({card_id: card_id}).$promise;
	}

	function addCard(card_data) {
		if ("title" in card_data) {
			return cardResource.save(card_data).$promise;
		} else {
			throw { error: "addCard: Invalid card-data" };
		}
	}

	function updateCard(card_data) {
		alert("updateCard not implemented yet");
	}

	return {
		getCard: getCard,
		addCard: addCard,
		updateCard: addCard
	};
}]);
