angular.module("card.services", [])
.factory("cardSvc", ["$resource", function($resource) {
	var cardResource = $resource("api1/cards", {}, {});

	function addCard(card) {
		return cardResource.save().$promise;
	}
}]);
